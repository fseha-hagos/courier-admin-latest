import { MapLoader } from "./utils/google-maps"
import { CreatePackageComponent } from "./components/create-package-component"
import { Main } from "@/components/layout/main"
import { Header } from "@/components/layout/header"
import { ThemeSwitch } from "@/components/theme-switch"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { CreatePackagePrimaryButtons } from "./components/create-package-primary-buttons"
import { useState, useCallback } from "react"

export default function CreatePackage() {
  const [clearTrigger, setClearTrigger] = useState(0);

  const handleClear = useCallback(() => {
    setClearTrigger(prev => prev + 1);
  }, []);

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold tracking-tight'>New Package</h2>
          <CreatePackagePrimaryButtons onClear={handleClear} />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <MapLoader>
            <CreatePackageComponent onClearAll={() => {}} clearTrigger={clearTrigger} />
          </MapLoader>
        </div>
      </Main>
    </>
  )
}

