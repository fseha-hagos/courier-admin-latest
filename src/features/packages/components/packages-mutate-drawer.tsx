import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { Package } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Package
}

const formSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  label: z.string().min(1, 'Please select a label.'),
  pickupLocation: z.string().min(1, 'Please select a pickup location.'),
  deliveryLocation: z.string().min(1, 'Please select a delivery location.'),
})
type PackagesForm = z.infer<typeof formSchema>

export function PackagesMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow

  const form = useForm<PackagesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      description: '',
      label: '',
      pickupLocation: '',
      deliveryLocation: '',
    },
  })

  const onSubmit = (data: PackagesForm) => {
    // do something with the form data
    onOpenChange(false)
    form.reset()
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Package</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the package by providing necessary info.'
              : 'Add a new package by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='package-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-5 flex-1'
          >
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter description' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem className='space-y-3 relative'>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select a label'
                      items={[
                        { label: 'Documentation', value: 'documentation' },
                        { label: 'Feature', value: 'feature' },
                        { label: 'Bug', value: 'bug' },
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name='pickupLocation'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Pickup Location</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select pickup location'
                    items={}
                  />
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            {/* <FormField
              control={form.control}
              name='deliveryLocation'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>Delivery Location</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select delivery location'
                    items={}
                  />
                  <FormMessage />
                </FormItem>
              )}
            /> */}
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form='package-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
