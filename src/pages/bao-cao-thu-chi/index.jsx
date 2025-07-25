import PageMeta from "../../components/common/PageMeta";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import BieuDoDoanhThuVaMucTieu from "../../modules/bao-cao-thu-chi/BieuDoDoanhThuVaMucTieu";
import BlockTongHop from "../../modules/bao-cao-thu-chi/BlockTongHop";

export default function BaoCaoThuChiPage() {
  return (
    <>
      <PageMeta title="Báo cáo tài chính" description="Trang quản trị báo cáo tài chính" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-12 xl:col-span-12">
          <BlockTongHop />
        </div>
        {/* <div className="col-span-12 space-y-6 xl:col-span-7">
          <MonthlySalesChart />
        </div> */}
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <BieuDoDoanhThuVaMucTieu />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        {/* <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div> */}
      </div>
    </>
  );
}
