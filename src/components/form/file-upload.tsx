import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { UploadDropzone } from "@/lib/uploadthing";

type Prop = {
    apiEndPoint: "agencyLogo"|"avatar"|"subAccountLogo"
    onChange: (url: string) =>void
    value?: string
};
export default function FileUpload({ 
    apiEndPoint,
    onChange,
    value}:Prop) {
        const type = value?.split(".").pop();
        
        if (type) {
            return(
                <div className="flex flex-col items-center justify-center">
                    {type !== "pdf" ? (
                        <div className="relative w-40 h-40">
                            <Image 
                                src={value|| ""} 
                                alt="uploaded img" 
                                className="object-contain" 
                                fill
                            />
                        </div>
                    ):(
                        <div className=" relative flex items-center p-2 mt-2 rounded-md bg-background/100">
                            <FileIcon />
                            <Link 
                                href={value || ""} 
                                target="_blank" 
                                rel="noopener_noreferrer"
                                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
                            >View PDF</Link>
                        </div>
                    )}
                    <Button type="button" variant="ghost" onClick={() => onChange("")}>
                        <X className="h-4 w-4"/>
                        Remove Logo
                    </Button>
                </div>
            )
        }
return (
    <div className="w-full bg-muted/30">
        <UploadDropzone 
            endpoint={apiEndPoint}
            onClientUploadComplete={(res) => {
                onChange(res?.[0].url)
            }}
            onUploadError={(error: Error) => {
                console.log(error);
            }}
        />
    </div>
)};
