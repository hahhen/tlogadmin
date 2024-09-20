"use client"

import Image from "next/image";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { signout } from "@/app/login/actions";

export default function Header() {
    const supabase = createClient()
    const [user, setUser] = useState(null);
    const fetchUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            setError(error.message);
        } else {
            setUser(data);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [])
    return (
        <div className="w-full flex justify-between items-center py-1 px-2 border-b">
            <Image width={50} height={50} src={"https://styles.redditmedia.com/t5_bufanl/styles/communityIcon_klg8a188udcd1.png"} />
            <Popover>
                <PopoverTrigger asChild><Button size="icon" className="rounded-full" variant="outline"><UserIcon strokeWidth={1}/></Button></PopoverTrigger>
                <PopoverContent className="flex flex-col gap-4">
                    <div>Logged in as {user?.user?.email}</div>
                    <Button onClick={() => {signout()}}>Log out</Button>
                    </PopoverContent>
            </Popover>
        </div>
    )
}