import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { PencilIcon, TrashBinIcon, PlusIcon } from "../../icons";
import tenantService from "../../service/tenant";

export default function QuanLyTenantPage() {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const { isOpen, openModal, closeModal } = useModal();
  const [isAddMode, setIsAddMode] = useState(false);
  const [formData, setFormData] = useState({
    tenant_code: "",
    tenant_name: "",
    db_host: "",
    db_port: 1433,
    db_name: "",
    db_user: "",
    db_password: "",
    is_active: true,
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const data = await tenantService.getAllTenants();
      setTenants(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách tenant!");
      console.error("Load tenants error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAddMode(true);
    setEditingTenant(null);
    setFormData({
      tenant_code: "",
      tenant_name: "",
      db_host: "",
      db_port: 1433,
      db_name: "",
      db_user: "",
      db_password: "",
      is_active: true,
    });
    openModal();
  };

  const handleEdit = (tenant) => {
    setIsAddMode(false);
    setEditingTenant(tenant);
    setFormData({
      tenant_code: tenant.tenant_code || "",
      tenant_name: tenant.tenant_name || "",
      db_host: tenant.db_host || "",
      db_port: tenant.db_port || 1433,
      db_name: tenant.db_name || "",
      db_user: tenant.db_user || "",
      db_password: "", // Không hiển thị password cũ
      is_active: tenant.is_active !== undefined ? tenant.is_active : true,
    });
    openModal();
  };

  const handleDelete = async (tenantId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tenant này?")) {
      return;
    }

    try {
      await tenantService.deleteTenant(tenantId);
      toast.success("Xóa tenant thành công!");
      loadTenants();
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa tenant thất bại!");
      console.error("Delete tenant error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tenant_code || !formData.tenant_name || !formData.db_host || !formData.db_name) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      const submitData = {
        tenant_code: formData.tenant_code,
        tenant_name: formData.tenant_name,
        db_host: formData.db_host,
        db_port: formData.db_port,
        db_name: formData.db_name,
        db_user: formData.db_user,
        db_password: formData.db_password,
        is_active: formData.is_active,
      };

      if (isAddMode) {
        await tenantService.createTenant(submitData);
        toast.success("Tạo tenant thành công!");
      } else {
        await tenantService.updateTenant(editingTenant.tenant_id, submitData);
        toast.success("Cập nhật tenant thành công!");
      }
      closeModal();
      setEditingTenant(null);
      setIsAddMode(false);
      loadTenants();
    } catch (error) {
      toast.error(error.response?.data?.message || (isAddMode ? "Tạo tenant thất bại!" : "Cập nhật tenant thất bại!"));
      console.error("Submit tenant error:", error);
    }
  };

  return (
    <>
      <PageMeta
        title="Quản Lý Tenant | Record Admin"
        description="Quản lý danh sách tenant"
      />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark max-w-full overflow-x-hidden">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex items-center justify-between">
          <h3 className="font-semibold text-black dark:text-white">Quản Lý Tenant</h3>
          <Button size="sm" onClick={handleAdd}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Thêm Tenant
          </Button>
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
                      Mã Tenant
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tên Tenant
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Database Host
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Database Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    tenants.map((tenant) => (
                      <tr
                        key={tenant.tenant_id}
                        className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                          {tenant.tenant_code}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                          {tenant.tenant_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                          {tenant.db_host}:{tenant.db_port}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                          {tenant.db_name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {tenant.is_active ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Hoạt động
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Vô hiệu hóa
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(tenant)}
                              className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                              title="Sửa"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(tenant.tenant_id)}
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

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {isAddMode ? "Thêm Tenant Mới" : "Sửa Tenant"}
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Mã Tenant <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    name="tenant_code"
                    placeholder="VD: TENANT001"
                    value={formData.tenant_code}
                    onChange={handleChange}
                    required
                    disabled={!isAddMode}
                  />
                </div>

                <div>
                  <Label>
                    Tên Tenant <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    name="tenant_name"
                    placeholder="VD: Công ty ABC"
                    value={formData.tenant_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Database Host <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    name="db_host"
                    placeholder="VD: 192.168.1.100"
                    value={formData.db_host}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>
                    Database Port <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    name="db_port"
                    placeholder="1433"
                    value={formData.db_port}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>
                  Database Name <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="db_name"
                  placeholder="VD: TenantDatabase001"
                  value={formData.db_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>
                    Database User <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    name="db_user"
                    placeholder="VD: sa"
                    value={formData.db_user}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label>
                    Database Password <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    name="db_password"
                    placeholder={isAddMode ? "Nhập mật khẩu" : "Để trống nếu không đổi"}
                    value={formData.db_password}
                    onChange={handleChange}
                    required={isAddMode}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <Label htmlFor="is_active" className="ml-2 cursor-pointer">
                  Kích hoạt
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {isAddMode ? "Tạo mới" : "Cập nhật"}
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

