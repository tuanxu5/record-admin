import { Route, BrowserRouter as Router, Routes } from "react-router";
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
    </>
  );
}
