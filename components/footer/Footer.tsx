import Link from "next/link";
import Image from "next/image";
import GithubLogo from "../../public/images/GitHub-Mark-32px.png";

export default function Footer() {
	const myLoader = ({ src }: any) => {
		return src;
	};
	return (
		<>
			<footer>
				<Link href={"https://github.com/pedromarquetti/"} target='_blank'>
					<a>
						<Image
							loader={myLoader}
							unoptimized={true}
							src={GithubLogo}
							// width={30}
							// height={30}
							alt='Visit me on github'></Image>
					</a>
				</Link>
				{/* <Image
					src={"../../public/images/GitHub-Mark-32px"}
					alt='Find me on Github'
					layout='fill'>
					<Link href={"github.com/pedromarquetti/"}></Link>
				</Image> */}
				<Link href={"/about"}>About</Link>
				<Link href={"/"}>Home</Link>
			</footer>
		</>
	);
}
