import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import authService from "../../service/auth";
import Label from "../form/Label";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    tenant_code: "",
    user_name: "",
    password: "",
    ma_dvcs: "CTY"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tenant_code) {
      toast.error("Vui lòng nhập mã database");
      return;
    }

    if (!formData.user_name || !formData.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!isChecked) {
      toast.error("Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authService.registerTenantUser(formData);

      if (response.success) {
        toast.success(response.message || "Đăng ký thành công! Vui lòng đăng nhập.");
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Đăng ký thất bại";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Đăng ký tài khoản đầu tiên
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Đăng ký tài khoản đầu tiên cho database (chỉ áp dụng cho database chưa có tài khoản nào)
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Database Selection */}
                <div>
                  <Label>
                    Mã số thuế <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="tenant_code"
                    value={formData.tenant_code}
                    onChange={handleChange}
                    placeholder="Nhập mã số thuế"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Nhập mã số thuế để đăng ký tài khoản đầu tiên. Chỉ có thể đăng ký nếu database chưa có tài khoản nào.
                  </p>
                </div>

                {/* Username */}
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    placeholder="Nhập username"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Password */}
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập password"
                      disabled={isSubmitting}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-3">
                  <Checkbox className="w-5 h-5" checked={isChecked} onChange={setIsChecked} />
                  <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                    Tôi đồng ý với{" "}
                    <span className="text-gray-800 dark:text-white/90">Điều khoản sử dụng</span> và{" "}
                    <span className="text-gray-800 dark:text-white">Chính sách bảo mật</span>
                  </p>
                </div>

                {/* Button */}
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    disabled={isSubmitting || !isChecked}
                  >
                    {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account?
                <Link to="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
