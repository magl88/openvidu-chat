import styles from "./Main.module.scss";
import { useNavigate } from "react-router-dom";

import { Layout, Typography, Form, Input, Button } from "antd";
import type { FormProps } from "antd";
import { TEXT_DATA } from "@/utils/constants";
const { Title } = Typography;
const { Header, Content } = Layout;

export function Main() {
	const navigate = useNavigate();

	type FieldType = {
		username: string;
		session: string;
	};

	const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
		console.log("Success:", values);
		navigate(`/session/${values.session}`, { state: { user: values.username } });
	};

	const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
		console.warn("Failed:", errorInfo);
	};

	return (
		<Layout className={styles.layout}>
			<Header className={styles.header}>
				<Title>{TEXT_DATA.joinSession}</Title>
			</Header>
			<Content className={styles.content}>
				<Form
					className={styles.form}
					name="basic"
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 18 }}
					style={{ maxWidth: 600 }}
					initialValues={{ remember: true }}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
					autoComplete="off"
				>
					<Form.Item<FieldType>
						initialValue={`User-${Math.floor(Math.random() * 100)}`}
						label="Username"
						name="username"
						rules={[{ required: true, message: "Please input your username!" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item<FieldType>
						initialValue={`DemoSession-${Math.floor(Math.random() * 100)}`}
						label="Session"
						name="session"
						rules={[{ required: true, message: "Please input your session!" }]}
					>
						<Input />
					</Form.Item>
					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button type="primary" htmlType="submit">
							{TEXT_DATA.join}
						</Button>
					</Form.Item>
				</Form>
			</Content>
		</Layout>
	);
}
