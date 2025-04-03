const mongoose = require("mongoose");

/**
 * Schema cho cài đặt hệ thống
 * Mỗi loại cài đặt được lưu trữ dưới dạng key-value
 * với key là tên của loại cài đặt và value là một đối tượng
 * chứa các cài đặt cụ thể
 */
const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Khóa cài đặt không được để trống"],
      unique: true,
      trim: true,
      enum: {
        values: ["general", "email", "appearance", "security", "moderation"],
        message: "Khóa cài đặt không hợp lệ",
      },
    },
    settings: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Cài đặt không được để trống"],
    },
  },
  {
    timestamps: true,
  }
);

// Phương thức lấy cài đặt theo khóa
settingSchema.statics.getByKey = async function (key) {
  const setting = await this.findOne({ key });
  return setting ? setting.settings : null;
};

// Phương thức cập nhật cài đặt
settingSchema.statics.updateSettings = async function (key, newSettings) {
  const setting = await this.findOne({ key });

  if (setting) {
    // Cập nhật cài đặt hiện có
    setting.settings = {
      ...setting.settings,
      ...newSettings,
    };
    await setting.save();
    return setting;
  } else {
    // Tạo cài đặt mới nếu không tồn tại
    return await this.create({
      key,
      settings: newSettings,
    });
  }
};

// Phương thức lấy tất cả cài đặt
settingSchema.statics.getAllSettings = async function () {
  const settings = await this.find();
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.settings;
    return acc;
  }, {});
};

// Phương thức kiểm tra cài đặt theo key và value
settingSchema.statics.checkSetting = async function (key, settingKey, value) {
  const setting = await this.findOne({ key });
  if (!setting) return false;

  return setting.settings[settingKey] === value;
};

// Phương thức reset cài đặt về mặc định
settingSchema.statics.resetToDefault = async function (key) {
  const defaultSettings = {
    general: {
      siteName: "Diễn đàn Lập trình",
      description: "Cộng đồng chia sẻ kiến thức về lập trình",
      logo: "/images/logo.png",
      favicon: "/images/favicon.ico",
      postsPerPage: 10,
      commentsPerPage: 15,
      allowRegistration: true,
      requireEmailVerification: true,
      allowUserProfileCustomization: true,
      defaultUserRole: "user",
      maintenanceMode: false,
    },
    email: {
      host: "",
      port: 587,
      secure: true,
      username: "",
      password: "",
      fromEmail: "no-reply@example.com",
      fromName: "Diễn đàn Lập trình",
    },
    appearance: {
      theme: "light",
      primaryColor: "#3498db",
      secondaryColor: "#2ecc71",
      fontFamily: "Roboto, sans-serif",
      customCSS: "",
    },
    security: {
      loginAttempts: 5,
      lockoutTime: 30, // phút
      passwordExpiry: 90, // ngày
      sessionTimeout: 60, // phút
      enableCaptcha: true,
    },
    moderation: {
      autoApproveComments: false,
      autoApproveFirstPost: false,
      filterWords: [],
      adminApproval: true,
    },
  };

  if (key) {
    // Reset một loại cài đặt cụ thể
    if (defaultSettings[key]) {
      return await this.updateSettings(key, defaultSettings[key]);
    }
    return null;
  } else {
    // Reset tất cả cài đặt
    const promises = Object.keys(defaultSettings).map((k) =>
      this.updateSettings(k, defaultSettings[k])
    );
    return await Promise.all(promises);
  }
};

// Index
settingSchema.index({ key: 1 });

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
