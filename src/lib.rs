#![no_std]

use core::sync::atomic::{AtomicU32, Ordering};

#[panic_handler]
fn handle_panic(_: &core::panic::PanicInfo) -> ! {
    loop {}
}

const MAX_WIDTH: u32 = 600;
const MAX_HEIGHT: u32 = 600;
const MAX_LEN: usize = (MAX_HEIGHT * MAX_WIDTH) as usize;

#[no_mangle]
static mut BUFFER: [u32; MAX_LEN] = [0; MAX_LEN];

static mut CANVAS_WIDTH: u32 = MAX_WIDTH;
static mut CANVAS_HEIGHT: u32 = MAX_HEIGHT;

static FRAME: AtomicU32 = AtomicU32::new(0);

#[no_mangle]
pub unsafe fn set_canvas_size(height: u32, width: u32) {
    CANVAS_WIDTH = width;
    CANVAS_HEIGHT = height;
}

#[no_mangle]
pub unsafe extern fn go() {
    // This is called from JavaScript, and should *only* be called from
    // JavaScript. If you maintain that condition, then we know that the &mut
    // we're about to produce is unique, and therefore safe.
    render_frame_safe(&mut BUFFER, CANVAS_HEIGHT, CANVAS_WIDTH)
}

// We split this out so that we can escape 'unsafe' as quickly as possible.
fn render_frame_safe(buffer: &mut [u32; MAX_LEN], height: u32, width: u32) {
    let f = FRAME.fetch_add(1, Ordering::Relaxed);

    for y in 0..height {
        for x in 0..width {
            match buffer.get_mut((y * width + x) as usize) {
                Some(v) => {
                    *v = f.wrapping_add((x ^ y) as u32) | 0xFF_00_00_00;
                },
                None => ()
            }
        }
    }
}
