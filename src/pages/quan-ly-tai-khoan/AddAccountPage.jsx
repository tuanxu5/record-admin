import { useState } from "react";
import { toast } from "react-toastify";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { useAuth } from "../../hooks/useAuth";

export default function AddAccountPage() {
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
    ma_dvcs: null,
    is_admin: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.user_name || !formData.password) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        user_name: formData.user_name,
        password: formData.password,
        is_admin: formData.is_admin || 0,
      };
      if (formData.ma_dvcs && formData.ma_dvcs.trim() !== "") {
        submitData.ma_dvcs = formData.ma_dvcs;
      }

      await register(submitData);
      toast.success("Thêm tài khoản thành công!");
      setFormData({
        user_name: "",
        password: "",
        ma_dvcs: null,
        is_admin: 0,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Thêm tài khoản thất bại!";
      toast.error(errorMessage);
      console.error("Register error:", error.response?.data || error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Thêm Tài Khoản | Record Admin"
        description="Thêm tài khoản mới vào hệ thống"
      />
      <div className="rounded-md border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-semibold text-black dark:text-white">Thêm Tài Khoản</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5 space-y-6 ">
            <div>
              <Label>
                Tên đăng nhập <span className="text-error-500">*</span>
              </Label>
              <Input
                name="user_name"
                placeholder="Nhập tên đăng nhập"
                value={formData.user_name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label>
                Mật khẩu <span className="text-error-500">*</span>
              </Label>
              <Input
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label>
                Mã ĐVCS
              </Label>
              <Input
                name="ma_dvcs"
                placeholder="Nhập mã đơn vị cơ sở (tùy chọn)"
                value={formData.ma_dvcs || ""}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_admin"
                name="is_admin"
                checked={formData.is_admin === 1}
                onChange={handleChange}
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <Label htmlFor="is_admin" className="ml-2 cursor-pointer">
                Quyền quản trị viên
              </Label>
            </div>

            <div>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? "Đang thêm..." : "Thêm tài khoản"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

