import "flatpickr/dist/flatpickr.min.css";
import { Vietnamese } from "flatpickr/dist/l10n/vn.js";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import Flatpickr from "react-flatpickr";
import { toast } from "react-toastify";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useTranslation } from "../../hooks/useTranslation";
import { CalenderIcon, CloseLineIcon, FileIcon, PencilIcon, TrashBinIcon } from "../../icons";
import hopDongService from "../../service/hop-dong";

export default function HopDongPage() {
  const { t } = useTranslation();
  const [hopDongList, setHopDongList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    so_hd: "",
    ngay_bd: "",
    ngay_kt: "",
    ten_kh: "",
    nd: "",
    gt_hd: "",
    tam_ung: "",
  });

  useEffect(() => {
    loadHopDong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHopDong = async () => {
    setIsLoading(true);
    try {
      const data = await hopDongService.getList();
      setHopDongList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || t("hopDong.loadError"));
      console.error("Load hop dong error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrencyInput = (value) => {
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/[^\d]/g, '');
    if (!numericValue) return '';
    // Format với dấu phẩy ngăn cách hàng nghìn
    return new Intl.NumberFormat('vi-VN').format(parseInt(numericValue));
  };

  const parseCurrencyValue = (value) => {
    // Loại bỏ dấu phẩy và chuyển thành số
    if (!value) return '';
    return value.replace(/[^\d]/g, '');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const formatDateValue = (date) => {
      if (!date) return "";
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      try {
        return new Date(date).toISOString().split('T')[0];
      } catch {
        return "";
      }
    };
    setFormData({
      so_hd: item.so_hd || "",
      ngay_bd: formatDateValue(item.ngay_bd),
      ngay_kt: formatDateValue(item.ngay_kt),
      ten_kh: item.ten_kh || "",
      nd: item.nd || "",
      gt_hd: item.gt_hd ? formatCurrencyInput(item.gt_hd.toString()) : "",
      tam_ung: item.tam_ung ? formatCurrencyInput(item.tam_ung.toString()) : "",
    });
    openModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("hopDong.confirmDelete"))) {
      return;
    }

    try {
      await hopDongService.delete(id);
      toast.success(t("hopDong.deleteSuccess"));
      loadHopDong();
    } catch (error) {
      toast.error(error.response?.data?.message || t("hopDong.deleteError"));
      console.error("Delete error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format số tiền cho gt_hd và tam_ung
    if (name === 'gt_hd' || name === 'tam_ung') {
      const formatted = formatCurrencyInput(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const formatDateLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateBdChange = (date) => {
    const formatted = date[0] ? formatDateLocal(date[0]) : "";
    setFormData((prev) => ({
      ...prev,
      ngay_bd: formatted,
    }));
  };

  const handleDateKtChange = (date) => {
    const formatted = date[0] ? formatDateLocal(date[0]) : "";
    setFormData((prev) => ({
      ...prev,
      ngay_kt: formatted,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.so_hd || !formData.ngay_bd || !formData.ngay_kt || !formData.ten_kh || !formData.gt_hd) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // Validate ngay_kt >= ngay_bd
    if (new Date(formData.ngay_kt) < new Date(formData.ngay_bd)) {
      toast.error("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!");
      return;
    }

    try {
      const submitData = {
        so_hd: formData.so_hd.trim(),
        ngay_bd: formData.ngay_bd,
        ngay_kt: formData.ngay_kt,
        ten_kh: formData.ten_kh.trim(),
        nd: formData.nd?.trim() || null,
        gt_hd: parseFloat(parseCurrencyValue(formData.gt_hd)) || 0,
        tam_ung: parseFloat(parseCurrencyValue(formData.tam_ung)) || 0,
      };

      if (editingItem) {
        await hopDongService.update(editingItem.id, submitData);
        toast.success(t("hopDong.updateSuccess"));
      } else {
        await hopDongService.create(submitData);
        toast.success(t("hopDong.addSuccess"));
      }

      closeModal();
      setEditingItem(null);
      setFormData({
        so_hd: "",
        ngay_bd: "",
        ngay_kt: "",
        ten_kh: "",
        nd: "",
        gt_hd: "",
        tam_ung: "",
      });
      loadHopDong();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || t("hopDong.actionError");
      toast.error(errorMessage);
      console.error("Submit error:", error.response?.data || error);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      so_hd: "",
      ngay_bd: "",
      ngay_kt: "",
      ten_kh: "",
      nd: "",
      gt_hd: "",
      tam_ung: "",
    });
    openModal();
  };

  const handleFileSelect = (file) => {
    if (file) {
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];
      const isExcel = allowedTypes.some((type) => file.type.includes(type)) ||
        file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

      if (!isExcel) {
        toast.error(t("hopDong.import.fileTypeError"));
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleFileSelect(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
    noClick: false,
    noKeyboard: false,
  });

  const handleImportExcel = async () => {
    if (!selectedFile) {
      toast.error(t("hopDong.import.selectFileError"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await hopDongService.importExcel(selectedFile);
      toast.success(
        `${t("hopDong.import.importSuccess")}: ${result.success} ${t("hopDong.import.recordsSuccess")}. ${result.failed > 0 ? `${result.failed} ${t("hopDong.import.recordsFailed")}.` : ""}`
      );
      if (result.errors && result.errors.length > 0) {
        console.warn("Import errors:", result.errors);
        // Show errors if any
        if (result.errors.length > 0) {
          toast.warning(`Có ${result.errors.length} lỗi trong quá trình import. Vui lòng kiểm tra console.`);
        }
      }
      setIsImportModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      loadHopDong();
    } catch (error) {
      toast.error(error.response?.data?.message || t("hopDong.import.importError"));
      console.error("Import error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      const d = date instanceof Date ? date : new Date(date);
      return d.toLocaleDateString("vi-VN");
    } catch {
      return "-";
    }
  };

  return (
    <>
      <div className="rounded-sm shadow-default dark:border-strokedark dark:bg-boxdark max-w-full overflow-x-hidden">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex items-center justify-between flex-wrap gap-4">
          <h3 className="font-semibold text-black dark:text-white">{t("hopDong.listTitle")}</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddNew}>
              {t("hopDong.addNew")}
            </Button>
            <Button
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {t("hopDong.importExcel")}
            </Button>
          </div>
        </div>

        <div className="p-6.5">
          {isLoading && hopDongList.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-lg border border-stroke dark:border-strokedark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-stroke dark:border-strokedark">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("hopDong.soHd")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("hopDong.ngayBd")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("hopDong.ngayKt")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("hopDong.tenKh")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("hopDong.nd")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("hopDong.gtHd")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("hopDong.tamUng")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("hopDong.conLai")}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                        {t("hopDong.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-stroke dark:divide-strokedark">
                    {hopDongList.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm font-medium">{t("hopDong.noData")}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      hopDongList.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.so_hd || <span className="text-gray-400 dark:text-gray-500">-</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {formatDate(item.ngay_bd)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {formatDate(item.ngay_kt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                              {item.ten_kh ? (
                                <span className="block truncate" title={item.ten_kh}>
                                  {item.ten_kh}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                              {item.nd ? (
                                <span className="block truncate" title={item.nd}>
                                  {item.nd}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.gt_hd !== null && item.gt_hd !== undefined ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  {formatNumber(parseFloat(item.gt_hd))}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.tam_ung !== null && item.tam_ung !== undefined ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                  {formatNumber(parseFloat(item.tam_ung))}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.con_lai !== null && item.con_lai !== undefined ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                  {formatNumber(parseFloat(item.con_lai))}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="inline-flex items-center justify-center p-2 text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                title={t("common.edit")}
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="inline-flex items-center justify-center p-2 text-red-600 transition-all duration-200 rounded-lg hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                title={t("common.delete")}
                              >
                                <TrashBinIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingItem ? t("hopDong.edit") : t("hopDong.add")}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {editingItem ? "Cập nhật thông tin hợp đồng" : "Thêm hợp đồng mới vào hệ thống"}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>{t("hopDong.form.soHd")} <span className="text-red-500">*</span></Label>
                <Input
                  name="so_hd"
                  type="text"
                  placeholder={t("hopDong.form.placeholderSoHd")}
                  value={formData.so_hd}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("hopDong.form.ngayBd")} <span className="text-red-500">*</span></Label>
                  <div className="relative mt-1">
                    <Flatpickr
                      value={formData.ngay_bd ? new Date(formData.ngay_bd) : null}
                      onChange={handleDateBdChange}
                      options={{
                        dateFormat: "d/m/Y",
                        locale: Vietnamese,
                        allowInput: true,
                        disableMobile: false,
                        clickOpens: true,
                        maxDate: formData.ngay_kt ? new Date(formData.ngay_kt) : null,
                      }}
                      placeholder={t("hopDong.form.placeholderNgayBd")}
                      className="h-11 w-full rounded-lg border border-stroke bg-transparent px-5 py-2.5 pr-12 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <CalenderIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>{t("hopDong.form.ngayKt")} <span className="text-red-500">*</span></Label>
                  <div className="relative mt-1">
                    <Flatpickr
                      value={formData.ngay_kt ? new Date(formData.ngay_kt) : null}
                      onChange={handleDateKtChange}
                      options={{
                        dateFormat: "d/m/Y",
                        locale: Vietnamese,
                        allowInput: true,
                        disableMobile: false,
                        clickOpens: true,
                        minDate: formData.ngay_bd ? new Date(formData.ngay_bd) : null,
                      }}
                      placeholder={t("hopDong.form.placeholderNgayKt")}
                      className="h-11 w-full rounded-lg border border-stroke bg-transparent px-5 py-2.5 pr-12 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <CalenderIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>{t("hopDong.form.tenKh")} <span className="text-red-500">*</span></Label>
                <Input
                  name="ten_kh"
                  type="text"
                  placeholder={t("hopDong.form.placeholderTenKh")}
                  value={formData.ten_kh}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label>{t("hopDong.form.nd")}</Label>
                <textarea
                  name="nd"
                  placeholder={t("hopDong.form.placeholderNd")}
                  value={formData.nd}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("hopDong.form.gtHd")} <span className="text-red-500">*</span></Label>
                  <Input
                    name="gt_hd"
                    type="text"
                    placeholder={t("hopDong.form.placeholderGtHd")}
                    value={formData.gt_hd}
                    onChange={handleChange}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label>{t("hopDong.form.tamUng")}</Label>
                  <Input
                    name="tam_ung"
                    type="text"
                    placeholder={t("hopDong.form.placeholderTamUng")}
                    value={formData.tam_ung}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-stroke dark:border-strokedark">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  {t("hopDong.form.cancel")}
                </Button>
                <Button type="submit" className="flex-1">
                  {editingItem ? t("hopDong.form.update") : t("hopDong.form.add")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Import Excel Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        className="max-w-lg p-6"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {t("hopDong.import.title")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t("hopDong.import.description")}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">
                📋 Định dạng file Excel:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Bắt buộc có header: <strong>SO_HD</strong>, <strong>NGAY_BD</strong>, <strong>NGAY_KT</strong>, <strong>TEN_KH</strong>, <strong>GT_HD</strong></li>
                <li>Tùy chọn: <strong>ND</strong>, <strong>TAM_UNG</strong>, <strong>CON_LAI</strong></li>
                <li><strong>SO_HD</strong>: Số hợp đồng (text), ví dụ: <strong>HD001</strong></li>
                <li><strong>NGAY_BD</strong>: Ngày bắt đầu hợp đồng (date), ví dụ: <strong>2025-01-15</strong></li>
                <li><strong>NGAY_KT</strong>: Ngày kết thúc hợp đồng (date), ví dụ: <strong>2025-12-31</strong></li>
                <li><strong>TEN_KH</strong>: Tên khách hàng (text), ví dụ: <strong>Công ty ABC</strong></li>
                <li><strong>ND</strong>: Nội dung (text, tùy chọn)</li>
                <li><strong>GT_HD</strong>: Giá trị hợp đồng (số), có thể có định dạng <strong>5,000,000.00</strong></li>
                <li><strong>TAM_UNG</strong>: Tạm ứng (số, tùy chọn), mặc định: <strong>0</strong></li>
                <li><strong>CON_LAI</strong>: Còn lại (số, tùy chọn), tự động tính nếu không có</li>
              </ul>
            </div>
          </div>
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 transition-all cursor-pointer ${isDragActive
              ? "border-primary bg-primary/5 dark:bg-primary/10"
              : "border-gray-300 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 bg-gray-50 dark:bg-gray-900/50"
              }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800">
                <FileIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              {isDragActive ? (
                <p className="text-sm font-medium text-primary mb-2">
                  {t("hopDong.import.dragActive")}
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("hopDong.import.dragDrop")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("hopDong.import.fileTypes")}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeSelectedFile}
                className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors flex-shrink-0"
                title={t("hopDong.import.removeFile")}
              >
                <CloseLineIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={() => {
                setIsImportModalOpen(false);
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="flex-1 bg-gray-500 hover:bg-gray-600"
              disabled={isLoading}
            >
              {t("hopDong.import.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleImportExcel}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? t("hopDong.import.importing") : t("hopDong.import.importBtn")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

