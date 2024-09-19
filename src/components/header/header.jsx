"use client"

import Image from "next/image";

export default function Header(){
    return(
        <div className="w-full py-1 px-2 border-b">
            <Image width={50} height={50} src={"https://styles.redditmedia.com/t5_bufanl/styles/communityIcon_klg8a188udcd1.png"}/>
        </div>
    )
}