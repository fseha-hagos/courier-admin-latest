import { MapLoader } from "./utils/google-maps"
import { CreatePackageComponent } from "./components/create-package-component"
import { Main } from "@/components/layout/main"
import { Header } from "@/components/layout/header"
import { ThemeSwitch } from "@/components/theme-switch"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { CreatePackagePrimaryButtons } from "./components/create-package-primary-buttons"

export default function CreatePackage() {
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
        <div className='mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>New Package</h2>
            <p className='text-muted-foreground'>
              Create a new package 
            </p>
          </div>
          <CreatePackagePrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <MapLoader>
            <CreatePackageComponent />
          </MapLoader>
        </div>
      </Main>
    </>
  )
}

