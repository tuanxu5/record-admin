import { Route, BrowserRouter as Router, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AppLayout from "./layout/AppLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Blank from "./pages/Blank";
import Calendar from "./pages/Calendar";
import BarChart from "./pages/Charts/BarChart";
import LineChart from "./pages/Charts/LineChart";
import Home from "./pages/Dashboard/Home";
import FormElements from "./pages/Forms/FormElements";
import NotFound from "./pages/OtherPage/NotFound";
import BasicTables from "./pages/Tables/BasicTables";
import Alerts from "./pages/UiElements/Alerts";
import Avatars from "./pages/UiElements/Avatars";
import Badges from "./pages/UiElements/Badges";
import Buttons from "./pages/UiElements/Buttons";
import Images from "./pages/UiElements/Images";
import Videos from "./pages/UiElements/Videos";
import UserProfiles from "./pages/UserProfiles";
import BaoCaoNhanhPage from "./pages/bao-cao-nhanh";
// import BaoCaoTaiChinhPage from "./pages/bao-cao-tai-chinh";
import BaoCaoTaiChinhPage from "./pages/bao-cao-tai-chinh";
import BaoCaoThuChiPage from "./pages/bao-cao-thu-chi";
import QuyTienMatPage from "./pages/von-bang-tien/QuyTienMat";
import TienGuiBIDVPage from "./pages/von-bang-tien/TienGuiBIDV";
import TienGuiViettinbankPage from "./pages/von-bang-tien/TienGuiViettinbank";
import AddAccountPage from "./pages/quan-ly-tai-khoan/AddAccountPage";
import ListAccountPage from "./pages/quan-ly-tai-khoan/ListAccountPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {" "}
            <Route index path="/bao-cao-thu-chi" element={<BaoCaoThuChiPage />} />
            <Route index path="/bao-cao-tai-chinh" element={<BaoCaoTaiChinhPage />} />
            <Route index path="/bao-cao-nhanh" element={<BaoCaoNhanhPage />} />
            <Route path="/von-bang-tien/quy-tien-mat" element={<QuyTienMatPage />} />
            <Route path="/von-bang-tien/tien-gui-bidv" element={<TienGuiBIDVPage />} />
            <Route path="/von-bang-tien/tien-gui-viettinbank" element={<TienGuiViettinbankPage />} />
            <Route path="/quan-ly-tai-khoan/them-tai-khoan" element={<AddAccountPage />} />
            <Route path="/quan-ly-tai-khoan/danh-sach" element={<ListAccountPage />} />
            <Route path="/cong-cu-dung-cu-do-van-phong" element={<Home />} />
            <Route path="/bao-cao-tai-chinh/bang-can-doi-so-phat-sinh-tai-khoan" element={<Home />} />
            <Route path="/bao-cao-tai-chinh/bang-can-doi-ke-toan" element={<Home />} />
            <Route path="/bao-cao-tai-chinh/ket-qua-hoat-dong-san-xuat-kinh-doanh" element={<Home />} />
            <Route path="/bao-cao-tai-chinh/luu-chuyen-tien-te" element={<Home />} />
            <Route path="/phan-tich-tai-chinh" element={<Home />} />
            <Route index path="/bao-cao-phan-he" element={<Home />} />
            <Route index path="/bao-cao-ton-kho" element={<Home />} />
            <Route index path="/bao-cao-quan-tri" element={<Home />} />
            <Route index path="/" element={<Home />} />
            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />
            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />
            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 999999 }}
      />
    </>
  );
}
