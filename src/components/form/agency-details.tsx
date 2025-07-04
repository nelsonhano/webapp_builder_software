"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NumberInput } from '@tremor/react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import * as z from "zod";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { deleteAgencyDetails, initUser, saveActivitiesNotifications, updateAgencyDetails, upsertAgency } from "@/lib/actions/queries";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { Agency } from "@/app/generated/prisma";
import { useForm } from "react-hook-form";
import { formShema } from "@/lib/utils";
import { Toaster } from "../ui/sonner";
import FileUpload from "./file-upload";
import Loading from "../global/loading";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Button } from "../ui/button";



type Props = {
    data?: Partial<Agency>
};

export default function AgencyDetails({ data }:Props) {
    const [deleteAgency, setDeleteAgency] = useState(false);
    const router = useRouter();
    const sooner = Toaster;
    const form = useForm<z.infer<typeof formShema>>({
        resolver: zodResolver(formShema),
        defaultValues: {
            name: data?.name,
            companyEmail: data?.companyEmail,
            companyPhone: data?.companyPhone,
            whiteLabel: data?.whiteLabel || false,
            address: data?.address,
            city: data?.city,
            zipCode: data?.zipCode,
            state: data?.state,
            country: data?.country,
            agencyLogo: data?.agencyLogo
        }
    });
    
    const isLoading = form.formState.isLoading;
    const handleSubmit = async (value: z.infer<typeof formShema>) => {
        try {
            let newUserData;
            let customerId;

            if (!data?.id) {
                const bodyDetails = {
                    email: value.companyEmail,
                    name: value.name,
                    shipping: {
                        address: {
                            city: value.city,
                            country: value.country,
                            line1: value.address,
                            postal_code: value.zipCode,
                            state: value.zipCode
                        },
                        name: value.name
                    },
                    address: {
                        city: value.city,
                        country: value.country,
                        line1: value.address,
                        postal_code: value.zipCode,
                        state: value.zipCode
                    },
                }
            };
            newUserData = await initUser({role: "AGENCY_OWNER"});

            if (!data?.customerId) {
                const res = await upsertAgency({
                    id: data?.id ? data.id : uuidv4(),
                    customerId: data?.customerId ?? "",
                    address: value.address,
                    agencyLogo: value.agencyLogo,
                    city: value.city,
                    companyPhone: value.companyPhone,
                    country: value.country,
                    name: value.name,
                    state: value.state,
                    whiteLabel: value.whiteLabel,
                    zipCode: value.zipCode,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    companyEmail: value.companyEmail,
                    connectAccountId: "",
                    goal: 5,
                });
                toast("Create Agency", {
                    description: "Your agency has been created",
                    action: {
                        label: "Undo",
                        onClick: () => console.log("Undo"),
                    },
                })
                if (data?.id) return router.refresh();
                if (res) return router.refresh();
            }
        } catch (error) {
            console.log(error);
            toast("Opps!", {
                description: "Could not create agency",
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                },
            });
        };
    };
    const handleDeleteAgency = async () => {
        if (!data?.id) return;
        setDeleteAgency(true);

        //WIP: discontinue the subscription
        try {
            const res = await deleteAgencyDetails(data.id);
            toast("Deleted Agency", {
                description: "Deleted your agency and all subaccounts",
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                },
            });
        } catch (error) {
            console.log(error);
            toast("Ooops", {
                description: "Couldn't deleted your agency",
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                },
            });
        } finally {
            setDeleteAgency(false);
        };
    };

    useEffect(()=>{
        if (data) {
            form.reset(data);
        }
    },[data]);

    return (
    <AlertDialog>
        <CardAction className="w-full">
            <CardHeader>
                <CardTitle>Agency Infomation</CardTitle>
                <CardDescription>
                    Let's creaet an agency for your business. You can edit agency setting
                    later from the agency setting tap
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField 
                            disabled={isLoading}
                            control={form.control}
                            name="agencyLogo"
                            render={({field}) =>(
                                <FormItem>
                                    <FormLabel>Logo</FormLabel>
                                    <FormControl>
                                        <FileUpload
                                            apiEndPoint="agencyLogo"
                                            onChange={field.onChange}
                                            value={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                            <div className="flex flex-col md:flex-row gap-4">
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Agency Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Your Agency Name" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="companyEmail"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} readOnly placeholder="Email" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex md:flex-row gap-4">
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="companyPhone"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Agency Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Phone" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="whiteLabel"
                                render={({ field }) => {
                                    return (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                                            <div>
                                                <FormLabel>Whitelabel Agency</FormLabel>
                                                <FormDescription>Turning on whilelabel mode will show your agency logo to all sub accounts by default. You can overwrite this functionality through sub account settings.</FormDescription>
                                            </div>

                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    );
                                }}
                            />
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 st..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex md:flex-row gap-4">
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>City</FormLabel>
                                            <FormControl>
                                                <Input placeholder="City" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>State</FormLabel>
                                            <FormControl>
                                                <Input placeholder="State" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="zipCode"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Zipcpde</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Zipcode" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                disabled={isLoading}
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Country</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Country" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {data?.id && (
                                <div className="flex flex-col gap-2">
                                    <FormLabel>Create A Goat</FormLabel>
                                    <FormDescription>✨ Create a goal for your agency. As your business grows your goals grow too so dont forget to set the bar higher!</FormDescription>
                                    <NumberInput
                                        defaultValue={data?.goal}
                                        onValueChange={async (val) => {
                                            if (data?.id) return;
                                            await updateAgencyDetails(data.id!, { goal: val });
                                            await saveActivitiesNotifications({
                                                agencyId: data.id,
                                                description: `Updated the agency goal to ${val} Sub Account`,
                                                subaccountId: undefined,
                                            });
                                            router.refresh();
                                        }}
                                        min={1}
                                        className="bg-background !border !border-input"
                                        placeholder="Sub Account Goal"
                                    />
                                </div>
                            )}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loading /> : " Save Agency Information"}
                            </Button>
                    </form>
                </Form>
                {!data?.id  && (
                    <div className="flex flex-col items-center justify-between
                    rounded-lg border border-destructive gap-4 p-4 mt-4">
                        <div>
                            <div>Danger Zone</div>
                        </div>
                        <div className="text-muted-foreground">
                            Deleting your agency can't be undone.
                            This will also delete all sub account and all
                            data related to your sub accounts. Sub accounts will 
                            no longer have access to funnels, contacts etc.
                        </div>
                        <AlertDialogTrigger
                            disabled={isLoading || deleteAgency}
                            className="text-red-600 p-2 text-center mt-2
                            rounded-md hover:bg-red-600 hover:text-white
                            whitespace-normal"
                        >
                            {deleteAgency ? "Deleting..." : "Delete Agency"}
                        </AlertDialogTrigger>
                    </div>
                )}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-left">
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left">
                            This action can't be undone. This will permanently
                            delete the Agency account and all related sub accounts
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex items-center">
                        <AlertDialogCancel>
                            <AlertDialogAction
                                disabled={deleteAgency}
                                className="bg-destructive hover:bg-destructive"
                                onClick={handleDeleteAgency}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </CardContent>
        </CardAction>
    </AlertDialog>
)};
