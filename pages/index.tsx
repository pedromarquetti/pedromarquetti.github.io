import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

function imageLoader({ src }: { src: any }): any {
	return src;
}
const Home: NextPage = () => {
	return (
		<div>
			<div className={styles.main}>
				<h1 className={styles.title}>Welcome to my Next.JS github pages!</h1>
				<h2>This is still a Work in Proggress</h2>
			</div>
		</div>
	);
};

export default Home;