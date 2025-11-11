import {
  Briefcase,
  FileText,
  Receipt,
  Target,
  TrendingDown,
  TrendingUp,
  UserCircle,
  Wallet,
  Zap
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import { useAuth } from "../hooks/useAuth";
import { useSidebar } from "../hooks/useSidebar";
import { useTranslation } from "../hooks/useTranslation";
import { BoxCubeIcon, ChevronDownIcon, HorizontaLDots, PieChartIcon, PlugInIcon } from "../icons";
import { Settings } from "lucide-react";

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { t } = useTranslation();
  const { isAdmin, isMasterAdmin } = useAuth();

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});
  const navItems = useMemo(() => {
    // Nếu là master admin (user từ DB QUANLY), chỉ hiển thị menu Quản lý tenant
    if (isMasterAdmin()) {
      return [
        {
          icon: <Settings />,
          name: "Quản lý Tenant",
          path: "/quan-ly-tenant",
        },
      ];
    }

    // Menu cho user từ tenant DB
    const items = [
      {
        icon: <Zap />,
        name: t("sidebar.quickReport"),
        path: "/bao-cao-nhanh",
      },
      {
        icon: <FileText />,
        name: t("sidebar.voucherListing"),
        path: "/bao-cao-tai-chinh",
      },
      {
        icon: <Wallet />,
        name: t("sidebar.cashFund"),
        subItems: [
          { name: t("sidebar.cashFundDetail"), path: "/von-bang-tien/quy-tien-mat", pro: false },
          { name: t("sidebar.bidvDeposit"), path: "/von-bang-tien/tien-gui-bidv", pro: false },
          { name: t("sidebar.viettinbankDeposit"), path: "/von-bang-tien/tien-gui-viettinbank", pro: false },
        ],
      },
      {
        icon: <TrendingDown />,
        name: t("sidebar.costs"),
        subItems: [
          { name: t("sidebar.costByCategory"), path: "/chi-phi/chi-phi-theo-khoan-muc", pro: false },
          { name: t("sidebar.salaryCost"), path: "/chi-phi/chi-phi-luong", pro: false },
          { name: t("sidebar.officeCost"), path: "/chi-phi/chi-phi-van-phong", pro: false },
        ],
      },
      {
        icon: <TrendingUp />,
        name: t("sidebar.revenue"),
        subItems: [
          { name: t("sidebar.talerRevenue"), path: "/doanh-thu/doanh-thu-taler", pro: false },
          { name: t("sidebar.otherRevenue"), path: "/doanh-thu/doanh-thu-khac", pro: false },
        ],
      },
      {
        icon: <Receipt />,
        name: t("sidebar.debt"),
        subItems: [
          { name: t("sidebar.receivables"), path: "/cong-no/cong-no-phai-thu", pro: false },
          { name: t("sidebar.payables"), path: "/cong-no/cong-no-phai-tra", pro: false },
        ],
      },
      {
        icon: <Target />,
        name: t("sidebar.plan"),
        subItems: [
          { name: t("sidebar.costPlanQuarter4"), path: "/ke-hoach/chi-phi-quy-4", pro: false },
          { name: t("sidebar.keHoachManagement"), path: "/ke-hoach", pro: false },
          { name: t("sidebar.hopDongManagement"), path: "/ke-hoach/hop-dong", pro: false },
          { name: t("sidebar.revenuePlan"), path: "/ke-hoach/doanh-thu", pro: false },
          { name: t("sidebar.costPlan"), path: "/ke-hoach/chi-phi", pro: false },
          
        ],
      },
      {
        icon: <FileText />,
        name: t("sidebar.financialReport"),
        subItems: [
          { name: t("sidebar.balanceSheetAccounts"), path: "/bao-cao-tai-chinh/bang-can-doi-so-phat-sinh-tai-khoan", pro: false },
          { name: t("sidebar.balanceSheet"), path: "/bao-cao-tai-chinh/bang-can-doi-ke-toan", pro: false },
          { name: t("sidebar.businessResult"), path: "/bao-cao-tai-chinh/ket-qua-hoat-dong-san-xuat-kinh-doanh", pro: false },
          { name: t("sidebar.cashFlow"), path: "/bao-cao-tai-chinh/luu-chuyen-tien-te", pro: false },
        ],
      },
      {
        icon: <TrendingUp />,
        name: t("sidebar.financialAnalysis"),
        path: "/phan-tich-tai-chinh",
      },
      {
        icon: <Briefcase />,
        name: t("sidebar.officeSupplies"),
        path: "/cong-cu-dung-cu-do-van-phong",
      },
    ];
    if (isAdmin()) {
      items.push({
        icon: <UserCircle />,
        name: t("sidebar.accountManagement"),
        subItems: [
          { name: t("sidebar.addAccount"), path: "/quan-ly-tai-khoan/them-tai-khoan", pro: false },
          { name: t("sidebar.listAccount"), path: "/quan-ly-tai-khoan/danh-sach", pro: false },
        ],
      });
    }

    return items;
  }, [t, isAdmin, isMasterAdmin]);

  const othersItems = useMemo(() => [
    {
      icon: <PieChartIcon />,
      name: "Charts",
      subItems: [
        { name: "Line Chart", path: "/line-chart", pro: false },
        { name: "Bar Chart", path: "/bar-chart", pro: false },
      ],
    },
    {
      icon: <BoxCubeIcon />,
      name: "UI Elements",
      subItems: [
        { name: "Alerts", path: "/alerts", pro: false },
        { name: "Avatar", path: "/avatars", pro: false },
        { name: "Badge", path: "/badge", pro: false },
        { name: "Buttons", path: "/buttons", pro: false },
        { name: "Images", path: "/images", pro: false },
        { name: "Videos", path: "/videos", pro: false },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: "Authentication",
      subItems: [
        { name: "Sign In", path: "/signin", pro: false },
        { name: "Sign Up", path: "/signup", pro: false },
      ],
    },
  ], []);
  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);
  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems, othersItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-[calc(100vh-4rem)] lg:h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`hidden lg:flex py-2 items-center justify-center border-b border-gray-200 dark:border-gray-800 transition-all duration-300 ${isExpanded || isHovered || isMobileOpen ? "px-4" : "px-0"
          }`}
      >
        <Link
          to="/"
          className="flex items-center justify-center w-full"
        >
          <img
            src="/images/logo/genlive.jpg"
            alt="Genlive Logo"
            className={`transition-all duration-300 object-contain rounded-lg shadow-sm ${isExpanded || isHovered || isMobileOpen
              ? "w-[60px] h-auto"
              : "w-[45px] h-[45px]"
              }`}
          />
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear pb-6 lg:max-h-[calc(100vh-4rem-80px)] max-h-[calc(100vh-4rem-20px)]">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
