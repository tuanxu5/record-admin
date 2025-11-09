import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import { useTranslation } from "../../hooks/useTranslation";
import { CloseLineIcon, FileIcon, PencilIcon, TrashBinIcon } from "../../icons";
import keHoachService from "../../service/keHoach";

export default function KeHoachPage() {
  const { t } = useTranslation();
  
  // Calculate current quarter
  const getCurrentQuarter = () => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    return Math.ceil(currentMonth / 3);
  };
  
  const currentQuarter = getCurrentQuarter();
  
  const [keHoachList, setKeHoachList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    thangdk: "",
    nam: "",
    ma_kh: "",
    kpi: "",
    ghi_chu: "",
  });

  useEffect(() => {
    loadKeHoach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadKeHoach = async () => {
    setIsLoading(true);
    try {
      const data = await keHoachService.getList();
      setKeHoachList(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.response?.data?.message || t("keHoach.loadError"));
      console.error("Load ke hoach error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      thangdk: item.thangdk?.toString() || "",
      nam: item.nam?.toString() || "",
      ma_kh: item.ma_kh || "",
      kpi: item.kpi || "",
      ghi_chu: item.ghi_chu || "",
    });
    openModal();
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("keHoach.confirmDelete"))) {
      return;
    }

    try {
      await keHoachService.delete(id);
      toast.success(t("keHoach.deleteSuccess"));
      loadKeHoach();
    } catch (error) {
      toast.error(error.response?.data?.message || t("keHoach.deleteError"));
      console.error("Delete error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.thangdk || !formData.nam) {
      toast.error("Vui lòng chọn tháng và năm!");
      return;
    }

    try {
      const submitData = {
        thangdk: formData.thangdk ? parseInt(formData.thangdk) : null,
        nam: formData.nam ? parseInt(formData.nam) : null,
        ma_kh: formData.ma_kh?.trim() || null,
        kpi: formData.kpi.trim() || null,
        ghi_chu: formData.ghi_chu?.trim() || null,
      };

      if (editingItem) {
        await keHoachService.update(editingItem.id, submitData);
        toast.success(t("keHoach.updateSuccess"));
      } else {
        await keHoachService.create(submitData);
        toast.success(t("keHoach.addSuccess"));
      }

      closeModal();
      setEditingItem(null);
      setFormData({
        thangdk: "",
        nam: "",
        ma_kh: "",
        kpi: "",
        ghi_chu: "",
      });
      loadKeHoach();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || t("keHoach.actionError");
      toast.error(errorMessage);
      console.error("Submit error:", error.response?.data || error);
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({
      thangdk: "",
      nam: "",
      ma_kh: "",
      kpi: "",
      ghi_chu: "",
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
        toast.error(t("keHoach.import.fileTypeError"));
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
      toast.error(t("keHoach.import.selectFileError"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await keHoachService.importExcel(selectedFile);
      toast.success(
        `${t("keHoach.import.importSuccess")}: ${result.success} ${t("keHoach.import.recordsSuccess")}. ${result.failed > 0 ? `${result.failed} ${t("keHoach.import.recordsFailed")}.` : ""}`
      );
      if (result.errors && result.errors.length > 0) {
        console.warn("Import errors:", result.errors);
      }
      setIsImportModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      loadKeHoach();
    } catch (error) {
      toast.error(error.response?.data?.message || t("keHoach.import.importError"));
      console.error("Import error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  return (
    <>
      <div className="rounded-sm shadow-default dark:border-strokedark dark:bg-boxdark max-w-full overflow-x-hidden">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex items-center justify-between flex-wrap gap-4">
          <h3 className="font-semibold text-black dark:text-white">{t("keHoach.costPlanQuarter")} {currentQuarter}</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddNew}>
              {t("keHoach.addNew")}
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
              {t("keHoach.importExcel")}
            </Button>
          </div>
        </div>

        <div className="p-6.5">
          {isLoading && keHoachList.length === 0 ? (
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
                        Tháng
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Năm
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("keHoach.maKh")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("keHoach.kpi")}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        {t("keHoach.luuY")}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                        {t("keHoach.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-stroke dark:divide-strokedark">
                    {keHoachList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm font-medium">{t("keHoach.noData")}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      keHoachList.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.thangdk || <span className="text-gray-400 dark:text-gray-500">-</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.nam || <span className="text-gray-400 dark:text-gray-500">-</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {item.ma_kh || <span className="text-gray-400 dark:text-gray-500">-</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {item.kpi !== null && item.kpi !== undefined ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  {formatNumber(parseFloat(item.kpi))}
                                </span>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                              {item.ghi_chu ? (
                                <span className="block truncate" title={item.ghi_chu}>
                                  {item.ghi_chu}
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
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-lg">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingItem ? t("keHoach.edit") : t("keHoach.add")}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {editingItem ? "Cập nhật thông tin kế hoạch" : "Thêm kế hoạch mới vào hệ thống"}
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tháng <span className="text-red-500">*</span></Label>
                  <select
                    name="thangdk"
                    value={formData.thangdk}
                    onChange={handleChange}
                    className="mt-1 h-11 w-full rounded-lg border border-stroke bg-transparent px-5 py-2.5 text-sm text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  >
                    <option value="">Chọn tháng</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        Tháng {month}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Năm <span className="text-red-500">*</span></Label>
                  <Input
                    name="nam"
                    type="number"
                    placeholder="Nhập năm (ví dụ: 2025)"
                    value={formData.nam}
                    onChange={handleChange}
                    className="mt-1"
                    min="2000"
                    max="2100"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>{t("keHoach.form.maKh")}</Label>
                <Input
                  name="ma_kh"
                  type="text"
                  placeholder={t("keHoach.form.placeholderMaKh")}
                  value={formData.ma_kh}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{t("keHoach.form.kpi")}</Label>
                <Input
                  name="kpi"
                  type="text"
                  placeholder={t("keHoach.form.placeholderKpi")}
                  value={formData.kpi}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{t("keHoach.luuY")}</Label>
                <textarea
                  name="ghi_chu"
                  placeholder={t("keHoach.form.placeholderLuuY")}
                  value={formData.ghi_chu}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-lg border border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-stroke dark:border-strokedark">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                >
                  {t("keHoach.form.cancel")}
                </Button>
                <Button type="submit" className="flex-1">
                  {editingItem ? t("keHoach.form.update") : t("keHoach.form.add")}
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
              {t("keHoach.import.title")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t("keHoach.import.description")}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">
                📋 Định dạng file Excel:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Bắt buộc có header: <strong>MA_KH</strong>, <strong>KPI</strong>, <strong>THANGDK</strong>, <strong>Nam</strong>, <strong>GHI_CHU</strong></li>
                <li><strong>THANGDK</strong>: Số tháng (1-12), ví dụ: <strong>10</strong> = tháng 10</li>
                <li><strong>Nam</strong>: Năm (số nguyên), ví dụ: <strong>2025</strong></li>
                <li><strong>KPI</strong>: Giá trị KPI (số), có thể có định dạng <strong>5,000,000.00</strong></li>
                <li><strong>MA_KH</strong>: Mã khách hàng (text), ví dụ: <strong>TALENT01</strong></li>
                <li><strong>GHI_CHU</strong>: Ghi chú (text, tùy chọn)</li>
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
                  {t("keHoach.import.dragActive")}
                </p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("keHoach.import.dragDrop")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("keHoach.import.fileTypes")}
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
                title={t("keHoach.import.removeFile")}
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
              {t("keHoach.import.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleImportExcel}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? t("keHoach.import.importing") : t("keHoach.import.importBtn")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

