import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SelectDropdown } from '@/components/select-dropdown';
import { Package } from '../data/schema';
import { useUsersStore } from '@/features/users/data/usersStore';
import { User } from '@/features/users/data/schema';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: Package;
}

const formSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer.'),
  description: z.string().min(1, 'Description is required.'),
  weight: z.number().min(1, 'Weight must be greater than 0.'),
  pickupLocationId: z.string().min(1, 'Please select a pickup location.'),
  deliveryLocationId: z.string().min(1, 'Please select a delivery location.'),
  labels: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
        label: z.string(),
      })
    )
    .optional(),
});
type PackagesForm = z.infer<typeof formSchema>;

export function PackagesMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  // locations,
  // customers,
}: Props) {
  const isUpdate = !!currentRow;
  const customers: User[] | null = useUsersStore((state) => state.users);

  const form = useForm<PackagesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      customerId: '',
      description: '',
      weight: 0,
      pickupLocationId: '',
      deliveryLocationId: '',
      labels: [],
    },
  });

  const onSubmit = (data: PackagesForm) => {
    // Handle form submission
    onOpenChange(false);
    form.reset();
    toast({
      title: 'Package Created',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        form.reset();
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Package</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the package by providing necessary info.'
              : 'Add a new package by providing necessary info. Click save when done.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id="package-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 flex-1"
          >
            {customers && (
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select a customer"
                        items={customers.map((customer) => ({
                          label: customer.name ?? '',
                          value: customer.id,
                        }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0.1}
                      step={0.1}
                      placeholder="Enter weight"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 
            Implement a location pickers for pickupLocation and deliveryLocation here
            <FormField
              control={form.control}
              name="pickupLocationId"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Pickup Location</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select pickup location"
                      items={locations.map((location) => ({
                        label: location.label,
                        value: location.id,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            {/* <FormField
              control={form.control}
              name="deliveryLocationId"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Delivery Location</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select delivery location"
                      items={locations.map((location) => ({
                        label: location.label,
                        value: location.id,
                      }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
          </form>
        </Form>
        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button form="package-form" type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
