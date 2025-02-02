/* eslint-disable no-console */
import { IconClearAll} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
// import { usePackagesStore } from '../../data/packagesStore'

interface CreatePackagePrimaryButtonsProps {
  onClear: () => void;
}

export function CreatePackagePrimaryButtons({ onClear }: CreatePackagePrimaryButtonsProps) {
  // const { setOpen } = usePackagesStore()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={onClear}
      >
        <span>Clear</span> <IconClearAll size={18} />
      </Button>
    </div>
  )
}
