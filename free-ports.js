const { execFile } = require("child_process");

const ports = [3000, 5000];

if (process.platform !== "win32") {
  console.log("Bỏ qua giải phóng cổng: môi trường không phải Windows.");
  process.exit(0);
}

ports.forEach((port) => {
  execFile("netstat", ["-ano"], (error, stdout) => {
    if (error) return;

    const line = stdout
      .split(/\r?\n/)
      .find((entry) => entry.includes(`:${port}`));
    const pid = line?.trim().split(/\s+/).pop();

    if (!pid || pid === "PID") return;

    execFile("taskkill", ["/F", "/PID", pid], (killError) => {
      if (killError) {
        console.log(`Không thể giải phóng cổng ${port}: ${killError.message}`);
      } else {
        console.log(`Đã giải phóng cổng ${port}`);
      }
    });
  });
});
