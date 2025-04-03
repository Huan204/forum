import React, { useState, useEffect } from "react";

const EmailNotifications = () => {
  const [emailConfig, setEmailConfig] = useState({
    smtpServer: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
    useSsl: true,
  });

  const [emailTemplates, setEmailTemplates] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState({
    id: "",
    name: "",
    subject: "",
    content: "",
    variables: [],
    active: true,
  });

  const [editMode, setEditMode] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const fetchEmailSettings = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.get('/api/admin/email-settings');
      // setEmailConfig(response.data.config);
      // setEmailTemplates(response.data.templates);

      // Dữ liệu mẫu
      const mockEmailConfig = {
        smtpServer: "smtp.example.com",
        smtpPort: "587",
        smtpUsername: "notification@example.com",
        smtpPassword: "password123",
        fromEmail: "support@example.com",
        fromName: "Diễn đàn Công nghệ",
        useSsl: true,
      };

      const mockEmailTemplates = [
        {
          id: "1",
          name: "welcome",
          subject: "Chào mừng bạn đến với Diễn đàn Công nghệ",
          content: `<p>Chào {{username}},</p>
<p>Chúng tôi rất vui mừng chào đón bạn đến với Diễn đàn Công nghệ - nơi chia sẻ kiến thức và thảo luận về công nghệ hàng đầu Việt Nam.</p>
<p>Bạn có thể bắt đầu bằng cách:</p>
<ul>
<li>Cập nhật thông tin cá nhân</li>
<li>Khám phá các bài viết mới nhất</li>
<li>Tham gia thảo luận với cộng đồng</li>
</ul>
<p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
<p>Trân trọng,<br>Đội ngũ Diễn đàn Công nghệ</p>`,
          variables: ["username", "email", "verificationLink"],
          active: true,
        },
        {
          id: "2",
          name: "password_reset",
          subject: "Đặt lại mật khẩu cho tài khoản của bạn",
          content: `<p>Xin chào,</p>
<p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
<p><a href="{{resetLink}}">Đặt lại mật khẩu</a></p>
<p>Liên kết này sẽ hết hạn sau 24 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
<p>Trân trọng,<br>Đội ngũ Diễn đàn Công nghệ</p>`,
          variables: ["username", "email", "resetLink"],
          active: true,
        },
        {
          id: "3",
          name: "new_post_notification",
          subject: "Bài viết mới trong danh mục bạn đang theo dõi",
          content: `<p>Xin chào {{username}},</p>
<p>Có một bài viết mới trong danh mục bạn đang theo dõi:</p>
<p><strong>{{postTitle}}</strong></p>
<p>Bài viết được đăng bởi: {{authorName}}</p>
<p>Nhấp vào liên kết dưới đây để xem bài viết:</p>
<p><a href="{{postLink}}">Xem bài viết</a></p>
<p>Trân trọng,<br>Đội ngũ Diễn đàn Công nghệ</p>`,
          variables: [
            "username",
            "postTitle",
            "authorName",
            "postLink",
            "categoryName",
          ],
          active: true,
        },
        {
          id: "4",
          name: "comment_notification",
          subject: "Có người bình luận vào bài viết của bạn",
          content: `<p>Xin chào {{username}},</p>
<p>{{commenterName}} đã bình luận vào bài viết "{{postTitle}}" của bạn:</p>
<blockquote>
{{commentContent}}
</blockquote>
<p>Nhấp vào liên kết dưới đây để xem bình luận:</p>
<p><a href="{{commentLink}}">Xem bình luận</a></p>
<p>Trân trọng,<br>Đội ngũ Diễn đàn Công nghệ</p>`,
          variables: [
            "username",
            "commenterName",
            "postTitle",
            "commentContent",
            "commentLink",
          ],
          active: true,
        },
        {
          id: "5",
          name: "account_locked",
          subject: "Tài khoản của bạn đã bị khóa tạm thời",
          content: `<p>Xin chào {{username}},</p>
<p>Chúng tôi thông báo rằng tài khoản của bạn trên Diễn đàn Công nghệ đã bị khóa tạm thời vì lý do sau:</p>
<p><strong>{{lockReason}}</strong></p>
<p>Tài khoản của bạn sẽ bị khóa đến: {{unlockDate}}.</p>
<p>Nếu bạn cho rằng đây là một sự nhầm lẫn hoặc cần giải thích thêm, vui lòng liên hệ với ban quản trị qua email: support@example.com</p>
<p>Trân trọng,<br>Đội ngũ Diễn đàn Công nghệ</p>`,
          variables: ["username", "email", "lockReason", "unlockDate"],
          active: true,
        },
      ];

      setEmailConfig(mockEmailConfig);
      setEmailTemplates(mockEmailTemplates);
    } catch (err) {
      setError("Không thể tải cài đặt email");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTemplateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentTemplate((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveEmailConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.put('/api/admin/email-settings/config', emailConfig);
      setSuccess("Cấu hình email đã được lưu thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Không thể lưu cấu hình email");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditTemplate = (template) => {
    setCurrentTemplate({ ...template });
    setEditMode(true);
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editMode) {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.put(`/api/admin/email-settings/templates/${currentTemplate.id}`, currentTemplate);

        // Cập nhật danh sách mẫu
        setEmailTemplates(
          emailTemplates.map((template) =>
            template.id === currentTemplate.id ? currentTemplate : template
          )
        );
      } else {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // const response = await axios.post('/api/admin/email-settings/templates', currentTemplate);
        // const newTemplate = response.data;

        // Thêm mẫu mới vào danh sách
        const newTemplate = {
          ...currentTemplate,
          id: Date.now().toString(),
        };
        setEmailTemplates([...emailTemplates, newTemplate]);
      }

      setSuccess(
        `Mẫu email ${
          editMode ? "đã được cập nhật" : "mới đã được tạo"
        } thành công!`
      );
      setShowTemplateModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Không thể ${editMode ? "cập nhật" : "tạo"} mẫu email`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail) {
      setError("Vui lòng nhập địa chỉ email để gửi thử");
      return;
    }

    setTestSending(true);
    setError(null);
    setSuccess(null);

    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.post('/api/admin/email-settings/test', {
      //   email: testEmail,
      //   config: emailConfig
      // });

      // Giả lập gửi email thành công
      setTimeout(() => {
        setSuccess(`Email thử nghiệm đã được gửi thành công đến ${testEmail}`);
        setTimeout(() => setSuccess(""), 3000);
      }, 2000);
    } catch (err) {
      setError("Không thể gửi email thử nghiệm");
      console.error(err);
    } finally {
      setTestSending(false);
    }
  };

  const handleToggleTemplateStatus = async (templateId, currentStatus) => {
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.patch(`/api/admin/email-settings/templates/${templateId}`, {
      //   active: !currentStatus
      // });

      // Cập nhật trạng thái trong danh sách
      setEmailTemplates(
        emailTemplates.map((template) =>
          template.id === templateId
            ? { ...template, active: !template.active }
            : template
        )
      );

      setSuccess("Đã cập nhật trạng thái mẫu email thành công!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Không thể cập nhật trạng thái mẫu email");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="px-6 py-4">
      <h1 className="text-3xl font-bold mb-6">Quản lý thông báo email</h1>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Cấu hình SMTP */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Cấu hình SMTP</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSaveEmailConfig}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="smtpServer"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Máy chủ SMTP
                </label>
                <input
                  type="text"
                  id="smtpServer"
                  name="smtpServer"
                  value={emailConfig.smtpServer}
                  onChange={handleConfigInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="smtpPort"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Cổng SMTP
                </label>
                <input
                  type="text"
                  id="smtpPort"
                  name="smtpPort"
                  value={emailConfig.smtpPort}
                  onChange={handleConfigInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="smtpUsername"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tên đăng nhập SMTP
                </label>
                <input
                  type="text"
                  id="smtpUsername"
                  name="smtpUsername"
                  value={emailConfig.smtpUsername}
                  onChange={handleConfigInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="smtpPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Mật khẩu SMTP
                </label>
                <input
                  type="password"
                  id="smtpPassword"
                  name="smtpPassword"
                  value={emailConfig.smtpPassword}
                  onChange={handleConfigInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="fromEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Địa chỉ email gửi
                </label>
                <input
                  type="email"
                  id="fromEmail"
                  name="fromEmail"
                  value={emailConfig.fromEmail}
                  onChange={handleConfigInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="fromName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tên người gửi
                </label>
                <input
                  type="text"
                  id="fromName"
                  name="fromName"
                  value={emailConfig.fromName}
                  onChange={handleConfigInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useSsl"
                  name="useSsl"
                  checked={emailConfig.useSsl}
                  onChange={handleConfigInputChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="useSsl"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Sử dụng SSL/TLS
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  placeholder="Email để gửi thử"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testSending || !testEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {testSending ? "Đang gửi..." : "Gửi thử"}
                </button>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu cấu hình"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mẫu email */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Mẫu email</h2>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên mẫu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Biến động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emailTemplates.map((template) => (
                  <tr key={template.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {template.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {template.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {template.variables.map((variable) => (
                          <span
                            key={variable}
                            className="inline-block mr-2 mb-1 px-2 py-1 text-xs bg-gray-100 rounded-full"
                          >
                            {`{{${variable}}}`}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleToggleTemplateStatus(
                            template.id,
                            template.active
                          )
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          template.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {template.active ? "Kích hoạt" : "Vô hiệu"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Template Edit Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editMode ? "Chỉnh sửa" : "Thêm"} mẫu email
              </h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={saving}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tên mẫu (định danh)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentTemplate.name}
                  onChange={handleTemplateInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  disabled={editMode} // Không cho phép sửa tên mẫu nếu đang chỉnh sửa
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tiêu đề email
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={currentTemplate.subject}
                  onChange={handleTemplateInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nội dung email (HTML)
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={currentTemplate.content}
                  onChange={handleTemplateInputChange}
                  rows="10"
                  className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
                  required
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Sử dụng định dạng HTML. Biến động có thể được sử dụng với cú
                  pháp {"{{"}
                  {"variableName}}"}
                </p>
              </div>

              <div>
                <label
                  htmlFor="variables"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Biến động (ngăn cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  id="variables"
                  name="variables"
                  value={currentTemplate.variables.join(", ")}
                  onChange={(e) =>
                    setCurrentTemplate({
                      ...currentTemplate,
                      variables: e.target.value
                        .split(",")
                        .map((v) => v.trim())
                        .filter((v) => v),
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={currentTemplate.active}
                  onChange={handleTemplateInputChange}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="active"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Kích hoạt mẫu này
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : "Lưu mẫu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailNotifications;
