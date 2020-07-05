fetch("rust_wasm_game.wasm")
  .then((response) => response.arrayBuffer())
  .then((bytes) => WebAssembly.instantiate(bytes))
  .then(onLoad);

function onLoad({ instance }) {
  const canvas = document.getElementById("demo-canvas");
  const buffer_address = instance.exports.BUFFER.value;
  let image;

  let doSetSize = true;
  function setSize() {
    let MAX_HEIGHT = 600;
    let MAX_WIDTH = 600;
    let ratio = window.innerWidth / window.innerHeight;
    let nh = Math.floor(Math.sqrt((MAX_HEIGHT * MAX_WIDTH) / ratio));
    let nw = Math.floor(ratio * nh);
    canvas.width = nw;
    canvas.height = nh;
    image = new ImageData(
      new Uint8ClampedArray(
        instance.exports.memory.buffer,
        buffer_address,
        4 * nw * nh
      ),
      nw
    );
    instance.exports.set_canvas_size(nh, nw);
    doSetSize = false;
  }

  window.addEventListener("resize", function () {
    doSetSize = true;
  });
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const render = () => {
    if (doSetSize) setSize();
    instance.exports.go();
    ctx.putImageData(image, 0, 0);
    requestAnimationFrame(render);
  };

  window.addEventListener("keydown", (e) => {
    if (wasmExports) {
      let key = charFromKey(e.key);
      wasmExports.setKeys(key);
    }
  });

  render();
}
