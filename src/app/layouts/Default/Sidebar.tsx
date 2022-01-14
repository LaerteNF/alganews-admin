import { Menu, Layout, Drawer, DrawerProps, Button } from "antd";
import {
  UserOutlined,
  LaptopOutlined,
  DiffOutlined,
  HomeOutlined,
  TableOutlined,
  PlusCircleOutlined,
  FallOutlined,
  RiseOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Link, useHistory, useLocation } from "react-router-dom";
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";
import { useMemo, useState } from "react";
import { SiderProps } from "antd/lib/layout";

import logo from "../../../assets/logo.svg";

const { Sider } = Layout;
const { SubMenu } = Menu;

// versão final do curso teve implementação dinâmica que exibe um componente ou outro (Sider ou Drawer) de acordo com o tamanho da tela
// para uma versão mais simples e mais 'entendível' ver implementação antes da aula 17.32 que era apenas um Sider
export default function DefaultLayoutSidebar() {
  const { lg } = useBreakpoint();
  const history = useHistory();
  const location = useLocation();

  const [show, setShow] = useState(true);

  const SidebarWrapper: React.FC = useMemo(() => (lg ? Sider : Drawer), [lg]);

  const siderProps = useMemo((): SiderProps => {
    return {
      width: 200,
      className: "site-layout-background no-print",
    };
  }, []);

  const drawerProps = useMemo((): DrawerProps => {
    return {
      visible: show,
      closable: true,
      title: (
        <>
          <img src={logo} alt={"logo alga news"} />
        </>
      ),
      headerStyle: {
        height: 64,
      },
      bodyStyle: {
        padding: 0,
      },
      onClose() {
        setShow(false);
      },
      placement: "left",
    };
  }, [show]);

  const sideBarProps = useMemo(() => {
    return lg ? siderProps : drawerProps;
  }, [lg, siderProps, drawerProps]);

  return (
    <>
      {!lg && (
        <Button
          icon={<MenuOutlined />}
          onClick={() => setShow(true)}
          type={"text"}
          style={{ position: "fixed", top: 0, left: 0, height: 64, zIndex: 99 }}
        />
      )}

      <SidebarWrapper {...sideBarProps}>
        <Menu
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          defaultOpenKeys={[location.pathname.split("/")[1]]}
          style={{ height: "100%", borderRight: 0 }}
        >
          <Menu.Item key={"/"} icon={<HomeOutlined />}>
            <Link to={"/"}>Home</Link>
          </Menu.Item>
          <SubMenu key="usuarios" icon={<UserOutlined />} title="Usuários">
            <Menu.Item
              key="/usuarios"
              onClick={() => history.push("/usuarios")}
              icon={<TableOutlined />}
            >
              <Link to={"/usuarios"}>Consulta</Link>
            </Menu.Item>
            <Menu.Item
              key="/usuarios/cadastro"
              onClick={() => history.push("/usuarios/cadastro")}
              icon={<PlusCircleOutlined />}
            >
              <Link to={"/usuarios/cadastro"}>Cadastro</Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key="pagamentos"
            icon={<LaptopOutlined />}
            title="Pagamentos"
          >
            <Menu.Item
              key="/pagamentos"
              onClick={() => history.push("/pagamentos")}
              icon={<TableOutlined />}
            >
              <Link to={"/pagamentos"}>Consulta</Link>
            </Menu.Item>
            <Menu.Item
              key="/pagamentos/cadastro"
              onClick={() => history.push("/pagamentos/cadastro")}
              icon={<PlusCircleOutlined />}
            >
              <Link to={"/pagamentos/cadastro"}>Cadastro</Link>
            </Menu.Item>
          </SubMenu>
          <SubMenu
            key="fluxo-de-caixa"
            icon={<DiffOutlined />}
            title="Fluxo de Caixa"
          >
            <Menu.Item
              key="/fluxo-de-caixa/despesas"
              onClick={() => history.push("/fluxo-de-caixa/despesas")}
              icon={<FallOutlined />}
            >
              <Link to={"/fluxo-de-caixa/despesas"}>Despesa</Link>
            </Menu.Item>
            <Menu.Item
              key="/fluxo-de-caixa/receitas"
              onClick={() => history.push("/fluxo-de-caixa/receitas")}
              icon={<RiseOutlined />}
            >
              <Link to={"/fluxo-de-caixa/receitas"}>Receita</Link>
            </Menu.Item>
          </SubMenu>
        </Menu>
      </SidebarWrapper>
    </>
  );
}
