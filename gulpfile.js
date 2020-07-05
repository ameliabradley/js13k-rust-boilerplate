const gulp = require("gulp");

const lintHTML = require("gulp-htmllint");
const lintCSS = require("gulp-stylelint");
const lintJS = require("gulp-eslint");
const deleteFiles = require("gulp-rimraf");
const minifyHTML = require("gulp-minify-html");
const minifyCSS = require("gulp-clean-css");
const minifyJS = require("gulp-terser");
const concat = require("gulp-concat");
const replaceHTML = require("gulp-html-replace");
const imagemin = require("gulp-imagemin");
const zip = require("gulp-zip");
const checkFileSize = require("gulp-check-filesize");
const spawn = require("child_process").spawn;
const fs = require("fs");
const chalk = require("chalk");
const filesize = require("filesize");

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    spawn(cmd, args, { stdio: "inherit" }).on("exit", function (error) {
      if (error) {
        reject();
        return;
      }

      resolve();
    });
  });
}

function showReduction(fileBefore, fileAfter, cb) {
  let before;
  return new Promise((resolve, reject) => {
    before = fs.statSync(fileBefore).size;
    resolve();
  })
    .then(cb)
    .then(() => {
      const after = fs.statSync(fileAfter).size;
      console.log(
        `${chalk.bold.green(fileAfter)} ${chalk.white(
          filesize(before, { format: "iec" })
        )} => ${chalk.yellow(filesize(after, { format: "iec" }))} (${
          (100 * (before - after) / before).toFixed(2)
        }% reduction)`
      );
    });
}

const paths = {
  src: {
    rs: "src/**.rs",
    html: "src/**.html",
    css: "src/css/**.css",
    js: "src/js/**.js",
    images: "src/images/**",
  },
  dist: {
    dir: "dist",
    css: "style.min.css",
    js: "script.min.js",
    images: "dist/images",
  },
  zip: {
    dir: "zip",
    name: "game.zip",
  },
};

const target = "wasm32-unknown-unknown";
const wasmname = 'rust_wasm_game.wasm';
const bin = `target/${target}/release/${wasmname}`;

gulp.task("lintHTML", () => {
  return gulp.src("src/**.html").pipe(lintHTML());
});

gulp.task("lintCSS", () => {
  return gulp.src(paths.src.css).pipe(
    lintCSS({
      reporters: [{ formatter: "string", console: true }],
    })
  );
});

gulp.task("lintJS", () => {
  return gulp.src(paths.src.js).pipe(lintJS()).pipe(lintJS.failAfterError());
});

gulp.task("cleanDist", () => {
  return gulp.src("dist/**/*", { read: false }).pipe(deleteFiles());
});

gulp.task("buildHTML", () => {
  console.log("building html...");
  return gulp
    .src(paths.src.html)
    .pipe(
      replaceHTML({
        css: paths.dist.css,
        js: paths.dist.js,
      })
    )
    .pipe(minifyHTML())
    .pipe(gulp.dest(paths.dist.dir));
});

gulp.task("buildCSS", () => {
  return gulp
    .src(paths.src.css)
    .pipe(concat(paths.dist.css))
    .pipe(minifyCSS())
    .pipe(gulp.dest(paths.dist.dir));
});

gulp.task("buildWasm", () => {
  return execShellCommand("cargo", ["build", "--target", target, "--release"]);
});

gulp.task("stripWasm", () => {
  return showReduction(bin, bin, () => execShellCommand("wasm-strip", [bin]));
});

gulp.task("optimizeWasm", () => {
  // This also moves the wasm file to the correct path
  const out = `${paths.dist.dir}/${wasmname}`;
  return showReduction(bin, out, () =>
    execShellCommand("wasm-opt", ["-o", out, "-Oz", bin])
  );
});

gulp.task("wasm", gulp.series("buildWasm", "stripWasm", "optimizeWasm"));

gulp.task("buildJS", () => {
  return gulp
    .src(paths.src.js)
    .pipe(concat(paths.dist.js))
    .pipe(minifyJS())
    .pipe(gulp.dest(paths.dist.dir));
});

gulp.task("optimizeImages", () => {
  return gulp
    .src(paths.src.images)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist.images));
});

gulp.task("zip", () => {
  const thirteenKb = 13 * 1024;

  gulp.src(`${paths.zip.dir}/*`).pipe(deleteFiles());

  return gulp
    .src(`${paths.dist.dir}/**`)
    .pipe(zip(paths.zip.name))
    .pipe(gulp.dest(paths.zip.dir))
    .pipe(checkFileSize({ fileSizeLimit: thirteenKb }));
});

gulp.task("test", gulp.parallel("lintHTML", "lintCSS", "lintJS"));

gulp.task(
  "build",
  gulp.series(
    "cleanDist",
    gulp.parallel("wasm", "buildHTML", "buildCSS", "buildJS", "optimizeImages"),
    "zip"
  )
);

gulp.task("watch", () => {
  gulp.watch(paths.src.rs, gulp.series("wasm", "zip"));
  gulp.watch(paths.src.html, gulp.series("buildHTML", "zip"));
  gulp.watch(paths.src.css, gulp.series("buildCSS", "zip"));
  gulp.watch(paths.src.js, gulp.series("buildJS", "zip"));
  gulp.watch(paths.src.images, gulp.series("optimizeImages", "zip"));
});

gulp.task("default", gulp.series("build", "watch"));
