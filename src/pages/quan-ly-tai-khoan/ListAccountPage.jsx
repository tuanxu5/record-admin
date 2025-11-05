import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon } from "../../icons";
import authService from "../../service/auth";

export default function ListAccountPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
    ma_dvcs: "",
    is_admin: 0,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await authService.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách tài khoản!");
      console.error("Load users error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      user_name: user.user_name || "",
      password: "",
      ma_dvcs: user.ma_dvcs || "",
      is_admin: user.is_admin || 0,
    });
    openModal();
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      return;
    }

    try {
      await authService.deleteUser(userId);
      toast.success("Xóa tài khoản thành công!");
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa tài khoản thất bại!");
      console.error("Delete user error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_name) {
      toast.error("Vui lòng nhập tên đăng nhập!");
      return;
    }

    try {
      const submitData = {
        user_name: formData.user_name,
        is_admin: formData.is_admin || 0,
      };

      // Only include password if provided
      if (formData.password && formData.password.trim() !== "") {
        submitData.password = formData.password;
      }

      // Only include ma_dvcs if it's not empty
      if (formData.ma_dvcs && formData.ma_dvcs.trim() !== "") {
        submitData.ma_dvcs = formData.ma_dvcs;
      }

      await authService.updateUser(editingUser.user_id, submitData);
      toast.success("Cập nhật tài khoản thành công!");
      closeModal();
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật tài khoản thất bại!");
      console.error("Update user error:", error);
    }
  };

  return (
    <>
      <PageMeta
        title="Danh Sách Tài Khoản | Record Admin"
        description="Quản lý danh sách tài khoản"
      />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex items-center justify-between">
          <h3 className="font-semibold text-black dark:text-white">Danh Sách Tài Khoản</h3>
          <Link to="/quan-ly-tai-khoan/them-tai-khoan">
            <Button size="sm">Thêm tài khoản</Button>
          </Link>
        </div>

        <div className="p-6.5">
          {isLoading ? (
            <div className="text-center py-10">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tên đăng nhập
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mã ĐVCS
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quyền quản trị
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.user_id}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                          {user.user_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                          {user.ma_dvcs || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {user.is_admin === 1 || user.is_admin === true ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                              title="Sửa"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.user_id)}
                              className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                              title="Xóa"
                            >
                              <TrashBinIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Sửa Tài Khoản
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label>
                  Tên đăng nhập <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="user_name"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.user_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Mật khẩu mới (để trống nếu không đổi)</Label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu mới"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Mã ĐVCS</Label>
                <Input
                  name="ma_dvcs"
                  placeholder="Nhập mã đơn vị cơ sở"
                  value={formData.ma_dvcs}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_admin"
                  name="is_admin"
                  checked={formData.is_admin === 1}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <Label htmlFor="edit_is_admin" className="ml-2 cursor-pointer">
                  Quyền quản trị viên
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Cập nhật
                </Button>
                <Button type="button" onClick={closeModal} className="flex-1 bg-red-500 text-gray-700 hover:bg-red-700">
                  Hủy
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

