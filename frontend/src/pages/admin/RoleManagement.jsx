import React, { useState, useEffect } from "react";

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    setLoading(true);
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const rolesResponse = await axios.get('/api/admin/roles');
      // const permissionsResponse = await axios.get('/api/admin/permissions');
      // setRoles(rolesResponse.data);
      // setPermissions(permissionsResponse.data);

      // Dữ liệu mẫu
      const mockRoles = [
        {
          id: 1,
          name: "Admin",
          description: "Quản trị viên với toàn quyền hệ thống",
          permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          userCount: 3,
          isSystem: true,
        },
        {
          id: 2,
          name: "Moderator",
          description: "Người kiểm duyệt nội dung",
          permissions: [3, 4, 5, 7, 8, 9, 11],
          userCount: 5,
          isSystem: true,
        },
        {
          id: 3,
          name: "Member",
          description: "Thành viên thông thường",
          permissions: [3, 4],
          userCount: 120,
          isSystem: true,
        },
        {
          id: 4,
          name: "VIP Member",
          description: "Thành viên cao cấp với quyền đặc biệt",
          permissions: [3, 4, 7, 8],
          userCount: 15,
          isSystem: false,
        },
        {
          id: 5,
          name: "Content Creator",
          description: "Người tạo nội dung cao cấp",
          permissions: [3, 4, 5, 6, 7],
          userCount: 8,
          isSystem: false,
        },
      ];

      const mockPermissions = [
        { id: 1, name: "manage_users", description: "Quản lý người dùng" },
        {
          id: 2,
          name: "manage_roles",
          description: "Quản lý vai trò và phân quyền",
        },
        { id: 3, name: "view_posts", description: "Xem bài viết" },
        { id: 4, name: "create_posts", description: "Tạo bài viết" },
        { id: 5, name: "edit_own_posts", description: "Sửa bài viết của mình" },
        {
          id: 6,
          name: "delete_own_posts",
          description: "Xóa bài viết của mình",
        },
        { id: 7, name: "create_comments", description: "Bình luận bài viết" },
        {
          id: 8,
          name: "edit_own_comments",
          description: "Sửa bình luận của mình",
        },
        { id: 9, name: "moderate_content", description: "Kiểm duyệt nội dung" },
        { id: 10, name: "manage_categories", description: "Quản lý danh mục" },
        {
          id: 11,
          name: "report_content",
          description: "Báo cáo nội dung vi phạm",
        },
        {
          id: 12,
          name: "manage_site_settings",
          description: "Quản lý cài đặt trang",
        },
        {
          id: 13,
          name: "view_analytics",
          description: "Xem thống kê phân tích",
        },
        { id: 14, name: "manage_badges", description: "Quản lý huy hiệu" },
        {
          id: 15,
          name: "system_backup",
          description: "Sao lưu và khôi phục hệ thống",
        },
      ];

      setRoles(mockRoles);
      setPermissions(mockPermissions);
    } catch (err) {
      setError("Không thể tải thông tin vai trò và quyền");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setSelectedPermissions(role.permissions);
    setShowEditModal(true);
  };

  const handleCreateRole = () => {
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setShowCreateModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // await axios.put(`/api/admin/roles/${selectedRole.id}`, {
      //   name: roleName,
      //   description: roleDescription,
      //   permissions: selectedPermissions
      // });

      // Cập nhật danh sách vai trò
      setRoles(
        roles.map((role) =>
          role.id === selectedRole.id
            ? {
                ...role,
                name: roleName,
                description: roleDescription,
                permissions: selectedPermissions,
              }
            : role
        )
      );

      setShowEditModal(false);
    } catch (err) {
      setError("Không thể cập nhật vai trò");
      console.error(err);
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    try {
      // API call sẽ được thêm sau khi tạo endpoint backend
      // const response = await axios.post('/api/admin/roles', {
      //   name: roleName,
      //   description: roleDescription,
      //   permissions: selectedPermissions
      // });
      // const newRole = response.data;

      // Thêm vai trò mới
      const newRole = {
        id: roles.length + 1,
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions,
        userCount: 0,
        isSystem: false,
      };

      setRoles([...roles, newRole]);
      setShowCreateModal(false);
    } catch (err) {
      setError("Không thể tạo vai trò mới");
      console.error(err);
    }
  };

  const handleDeleteRole = async (roleId) => {
    // Kiểm tra xem có phải vai trò hệ thống không
    const roleToDelete = roles.find((role) => role.id === roleId);
    if (roleToDelete.isSystem) {
      alert("Không thể xóa vai trò hệ thống!");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa vai trò này?")) {
      try {
        // API call sẽ được thêm sau khi tạo endpoint backend
        // await axios.delete(`/api/admin/roles/${roleId}`);

        // Xóa vai trò khỏi danh sách
        setRoles(roles.filter((role) => role.id !== roleId));
      } catch (err) {
        setError("Không thể xóa vai trò");
        console.error(err);
      }
    }
  };

  const togglePermission = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const getPermissionNameById = (id) => {
    const permission = permissions.find((p) => p.id === id);
    return permission ? permission.description : "";
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý phân quyền</h1>
        <button
          onClick={handleCreateRole}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Thêm vai trò mới
        </button>
      </div>

      {/* Danh sách vai trò */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số người dùng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quyền hạn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {role.name}
                  {role.isSystem && (
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Hệ thống
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{role.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {role.userCount}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permId) => (
                      <span
                        key={permId}
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
                      >
                        {getPermissionNameById(permId)}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                        +{role.permissions.length - 3} quyền khác
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Sửa
                  </button>
                  {!role.isSystem && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bảng quyền hạn */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Danh sách quyền hạn</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã quyền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên quyền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {permissions.map((permission) => (
                <tr key={permission.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                    {permission.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {permission.description}
                  </td>
                  <td className="px-6 py-4">
                    {roles
                      .filter((role) =>
                        role.permissions.includes(permission.id)
                      )
                      .map((role) => (
                        <span
                          key={role.id}
                          className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-1"
                        >
                          {role.name}
                        </span>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sửa vai trò</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
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

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Tên vai trò</label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  disabled={selectedRole.isSystem}
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Quyền hạn</label>
                <div className="border border-gray-300 rounded-md p-3 h-60 overflow-y-auto">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="mr-2"
                        />
                        <span className="font-medium">
                          {permission.description}
                        </span>
                        <span className="ml-2 text-gray-500 text-sm">
                          ({permission.name})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Thêm vai trò mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
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

            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Tên vai trò</label>
                <input
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Quyền hạn</label>
                <div className="border border-gray-300 rounded-md p-3 h-60 overflow-y-auto">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="mr-2"
                        />
                        <span className="font-medium">
                          {permission.description}
                        </span>
                        <span className="ml-2 text-gray-500 text-sm">
                          ({permission.name})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Tạo vai trò
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
