import Image from "next/image";

export const ScoopLoader = ({size = 36}) => {

    return (
        <Image
            width={size}
            height={size}
            src={'/Scoop_Loader.gif'}
            alt={'Scoop loader'}
        />
    )
}
