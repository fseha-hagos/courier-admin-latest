/* eslint-disable no-console */
import { IconClearAll} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
// import { usePackagesStore } from '../../data/packagesStore'

export function CreatePackagePrimaryButtons() {
  // const { setOpen } = usePackagesStore()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => console.log('Clear form')}
      >
        <span>Clear</span> <IconClearAll size={18} />
      </Button>
    </div>
  )
}
