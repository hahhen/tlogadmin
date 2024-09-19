"use client"

import { createClient } from '@/utils/supabase/client'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { atom, useAtom } from "jotai"
import { FileUploader } from "react-drag-drop-files";
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'

// export const tracksAtom = atom([null])

export default function Home() {
    const supabase = createClient()
    const [tracks, setTracks] = useState([null])
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [defaultValues, setDefaultValues] = useState({})
    const [albumMode, setAlbumMode] = useState('newalbum');
    const [albums, setAlbums] = useState(null);
    const [cover, setCover] = useState(null);

    const formSchema = z.object({
        existingalbum: z.object({
            id: albumMode == "existingalbum" ? z.coerce.number() : z.coerce.number().optional(),
        }),
        newalbum: z.object({
            title: albumMode == 'newalbum' ? z.string().min(2).max(50) : z.string().optional(),
            video: z.string().optional(),
            folder_icon: typeof window === 'undefined' ?
                z.any().optional()
                :
                z.instanceof(FileList).optional(),
            cover: typeof window === 'undefined' ?
                z.any().optional()
                :
                albumMode == 'newalbum' ?
                    z.instanceof(FileList).refine((file) => file?.length == 1, 'File is required.')
                    :
                    z.instanceof(FileList).optional(),
        }),
        tracks: z.array(
            z.object({
                title: z.string().min(2).max(50),
                track_number: z.coerce.number().int().positive(),
            })
        ),
    })

    const fetchUser = async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            setError(error.message);
        } else {
            setUser(data);
        }
    };

    const fetchAlbums = async () => {
        const { data, error } = await supabase.from('album').select('*');
        if (error) {
            setError(error.message);
        } else {
            setAlbums(data);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchAlbums();
    }, [])


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
    })
    useEffect(() => {
        setDefaultValues({
            tracks: tracks.slice(1).map((track, index) => ({
                title: track.name,
                track_number: index + 1,
            }),
            )
        })
    }, [tracks])

    useEffect(() => {
        form.reset(defaultValues);
    }, [defaultValues, form.reset]);

    // 2. Define a submit handler.
    async function onSubmit(values) {
        const requestBody = {
            newalbum: albumMode == "newalbum" ? values.newalbum : null,
            existingalbum: albumMode == "existingalbum" ?
                values.existingalbum
                :
                {
                    id: null
                },
            tracks: values.tracks.map((track, i) => ({
                ...track,
                file: tracks[track.track_number],
            })),
        }

        const formData = new FormData();

        formData.append('newalbum[title]', requestBody.newalbum.title);
        formData.append('newalbum[cover]', requestBody.newalbum.cover[0]);

        formData.append('existingalbum[id]', requestBody.existingalbum.id);
        requestBody.tracks.forEach((track, index) => {
            formData.append(`tracks[${index}][title]`, track.title);
            formData.append(`tracks[${index}][track_number]`, track.track_number);
            formData.append(`tracks[${index}][file]`, track.file);
        });

        console.log("Enviado")

        // await fetch('/api/upload/', {
        //     method: 'POST',
        //     body: formData,
        //     cache: 'default',
        // }).then(async (res) => {
        //     console.log("Recebido")
        //     console.log(await res.json())
        // })

        console.log(requestBody)
    }

    const handleChange = async (file) => {
        for (const key of Object.keys(file)) {
            await setTracks((prevTracks) => [...prevTracks, file[key]]);
        }
    };

    const fileTypes = ["WAV", "MP3", "FLAC"];

    const fileRef = form.register("newalbum.cover");
    const file2Ref = form.register("newalbum.folder_icon");
    return (
        <main className="flex w-full flex-col items-center justify-between py-4 px-2">
            <p className='text-sm border rounded-md p-2 mb-2'>Logged in as {user?.user?.email}</p>
            <div className="container px-4 max-w-5xl mx-auto">
                {tracks.length > 1 &&
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div>
                                <Tabs defaultValue="new">
                                    <TabsList>
                                        <TabsTrigger onClick={() => setAlbumMode("newalbum")} value="new">New album</TabsTrigger>
                                        <TabsTrigger onClick={() => setAlbumMode("existingalbum")} value="existing">Existing album</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="new" className="grid grid-cols-3 gap-4">
                                        <div className='gap-4 flex flex-col'>
                                            <FormField
                                                control={form.control}
                                                name="newalbum.cover"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Cover</FormLabel>
                                                        <FormControl>
                                                            <Input type="file" {...fileRef}
                                                                onChange={(event) => {
                                                                    field.onChange(event.target?.files?.[0] ?? undefined)
                                                                    setCover(URL.createObjectURL(event.target.files[0]))
                                                                }} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="newalbum.title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Title</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Album title" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className='gap-4 flex flex-col'>
                                            <FormField
                                                control={form.control}
                                                name="newalbum.folder_icon"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Folder icon (optional)</FormLabel>
                                                        <FormControl>
                                                            <Input type="file" {...file2Ref}
                                                                onChange={(e) => field.onChange(e.target.files[0])} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="newalbum.video"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Video (optional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Album title" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        {cover && <Image src={cover} alt="Cover" width={200} height={200} className='rounded-lg w-full' />}
                                    </TabsContent>
                                    <TabsContent value="existing">
                                        <FormField
                                            control={form.control}
                                            name="existingalbum.id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Album</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-[180px]">
                                                                <SelectValue placeholder="Select an album" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {albums?.map((album) => (
                                                                <SelectItem key={album.id} value={`${album.id}`}>
                                                                    {album.title}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>Select an existing album</FormDescription>
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>File</TableHead>
                                        <TableHead>Track Number</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {...tracks.slice(1).map((track, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`tracks.${index}.title`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input placeholder="Track title" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {(track.name.length - 5 > 20 ? track.name.substring(0, 20) + "..." + track.name.substring(track.name.length - 5) : track.name)}
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`tracks.${index}.track_number`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                }
                <div className='w-full flex justify-center'>
                    <FileUploader handleChange={handleChange} maxSize={50} multiple={true} classes="!h-96 !w-96" name="file" types={fileTypes} />
                </div>

            </div>
        </main>
    );
}
