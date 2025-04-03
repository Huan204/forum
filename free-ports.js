const { exec } = require("child_process");

// Danh sách cổng cần kiểm tra và giải phóng
const ports = [3000, 5000];

// Kiểm tra và giải phóng các cổng trên Windows
ports.forEach((port) => {
  console.log(`Kiểm tra cổng ${port}...`);

  // Lệnh để tìm process đang sử dụng cổng
  const findCommand = `netstat -ano | findstr :${port}`;

  exec(findCommand, (error, stdout, stderr) => {
    if (error) {
      console.log(`Không tìm thấy process nào sử dụng cổng ${port}`);
      return;
    }

    if (stdout) {
      // Tìm PID từ output
      const lines = stdout.trim().split("\n");

      if (lines.length > 0) {
        try {
          // Lấy PID từ dòng đầu tiên (cột cuối cùng)
          const pid = lines[0].trim().split(/\s+/).pop();

          if (pid && pid !== "PID") {
            console.log(`Đang giải phóng cổng ${port} (PID: ${pid})...`);

            // Lệnh để kill process
            exec(
              `taskkill /F /PID ${pid}`,
              (killError, killStdout, killStderr) => {
                if (killError) {
                  console.log(
                    `Không thể kill process với PID ${pid}: ${killError.message}`
                  );
                } else {
                  console.log(`Đã giải phóng cổng ${port}`);
                }
              }
            );
          }
        } catch (e) {
          console.log(`Lỗi xử lý output cho cổng ${port}: ${e.message}`);
        }
      }
    } else {
      console.log(`Không tìm thấy process nào sử dụng cổng ${port}`);
    }
  });
});
