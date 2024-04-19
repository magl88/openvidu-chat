import { memo } from "react";
import styles from "./MainLayout.module.scss";
import { Outlet } from "react-router-dom";
import { Layout, Image } from "antd";
import { Link } from "react-router-dom";
import { TEXT_DATA } from "@/utils/constants";
const { Header, Content, Footer } = Layout;

export const MainLayout = memo(() => {
	return (
		<Layout className={styles.layout}>
			<Header className={styles.header}>
				<Link to={"/"}>
					<Image
						className={styles.logo}
						preview={false}
						alt={TEXT_DATA.logo}
						width={200}
						src="/logo.webp"
					/>
				</Link>
			</Header>
			<Content className={styles.content}>
				<Outlet />
			</Content>
			<Footer className={styles.footer}>
				Chat Design ©{new Date().getFullYear()} Created by Magl
			</Footer>
		</Layout>
	);
});
