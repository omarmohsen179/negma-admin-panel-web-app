import { Fragment } from "react";
import Scrollbar from "react-perfect-scrollbar";
import { styled } from "@mui/material";
import { MatxVerticalNav } from "app/components";
import useSettings from "app/hooks/useSettings";
import { navigations } from "app/navigations";
import useAuth from "app/hooks/useAuth";
import { getCurrentUserAdminType } from "app/auth/adminTypes";
import { useTranslation } from "react-i18next";
const StyledScrollBar = styled(Scrollbar)(({ i18n }) => ({
  paddingLeft: "1rem",
  paddingRight: "1rem",
  direction: i18n.language == "en" ? "lrt" : "rtl",
  position: "relative",
}));

const SideNavMobile = styled("div")(({ theme }) => ({
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: "100vw",
  background: "rgba(0, 0, 0, 0.54)",
  zIndex: -1,
  [theme.breakpoints.up("lg")]: { display: "none" },
}));
const Sidenav = ({ children }) => {
  const { settings, updateSettings } = useSettings();
  const { t, i18n } = useTranslation();
  const updateSidebarMode = (sidebarSettings) => {
    let activeLayoutSettingsName = settings.activeLayout + "Settings";
    let activeLayoutSettings = settings[activeLayoutSettingsName];

    updateSettings({
      ...settings,
      [activeLayoutSettingsName]: {
        ...activeLayoutSettings,
        leftSidebar: {
          ...activeLayoutSettings.leftSidebar,
          ...sidebarSettings,
        },
      },
    });
  };
  const { logout, user, lookups } = useAuth();

  return (
    <Fragment>
      <StyledScrollBar i18n={i18n} options={{ suppressScrollX: true }}>
        {children}
        {/* {lookups != null ? (
          <div className="side-content-div">
            <MatxVerticalNav items={navigations(lookups.Roles)} />
          </div>
        ) : null} */}
        <div className="side-content-div">
          <MatxVerticalNav items={navigations(getCurrentUserAdminType())} />
        </div>
      </StyledScrollBar>

      <SideNavMobile onClick={() => updateSidebarMode({ mode: "close" })} />
    </Fragment>
  );
};

export default Sidenav;
