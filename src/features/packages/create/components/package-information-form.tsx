import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { IconChevronsRight } from "@tabler/icons-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { UseFormReturn } from "react-hook-form"
import { PackageForm } from "../types"
import { labels } from '../../data/data'

const WEIGHT_RANGES = [
  {
    id: "small",
    label: "Small Package",
    description: "0.1 - 5 kg",
    value: "0.1-5",
    recommendedVehicle: "BICYCLE",
    priceRange: "100-200 Birr"
  },
  {
    id: "medium",
    label: "Medium Package",
    description: "5 - 15 kg",
    value: "5-15",
    recommendedVehicle: "MOTORCYCLE",
    priceRange: "200-350 Birr"
  },
  {
    id: "large",
    label: "Large Package",
    description: "15 - 30 kg",
    value: "15-30",
    recommendedVehicle: "MOTORCYCLE",
    priceRange: "350-500 Birr"
  },
  {
    id: "xlarge",
    label: "Extra Large Package",
    description: "30 - 100 kg",
    value: "30-100",
    recommendedVehicle: "CAR",
    priceRange: "500-1000 Birr"
  },
] as const;

interface PackageInformationFormProps {
  form: UseFormReturn<PackageForm>
  className?: string
}

export function PackageInformationForm({ form, className }: PackageInformationFormProps) {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <Card className={cn("mb-4", className)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Package Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weight Range Selector */}
        <FormField
          control={form.control}
          name="weightRange"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Package Weight Range</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-2 gap-4"
                >
                  {WEIGHT_RANGES.map((range) => (
                    <div key={range.id} className="relative">
                      <RadioGroupItem
                        value={range.value}
                        id={range.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={range.id}
                        className={cn(
                          "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4",
                          "hover:bg-accent hover:text-accent-foreground",
                          "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                          "[&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5",
                          "cursor-pointer transition-colors"
                        )}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold">{range.label}</span>
                          <span className="text-xs text-muted-foreground">{range.description}</span>
                          <span className="text-xs text-muted-foreground">Price: {range.priceRange}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Recommended:</span>
                            <Badge variant="secondary" className="font-normal">
                              {range.recommendedVehicle.charAt(0) + range.recommendedVehicle.slice(1).toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                        {field.value === range.value && (
                          <Check className="absolute top-3 right-3 h-4 w-4 text-primary" />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Select the weight range that best matches your package. This will help determine pricing and vehicle type.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Package Labels */}
        <FormField
          control={form.control}
          name="labels"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Package Labels</FormLabel>
              {Array.isArray(field.value) && field.value.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {field.value.map((labelValue) => {
                    const label = labels.find((l) => l.value === labelValue);
                    return (
                      <Badge
                        key={labelValue}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {label?.label}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => {
                            const newLabels = Array.isArray(field.value)
                              ? field.value.filter((l) => l !== labelValue)
                              : [];
                            field.onChange(newLabels);
                          }}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !field.value?.length && "text-muted-foreground"
                    )}
                  >
                    {field.value && field.value.length > 0
                      ? `${field.value.length} label${field.value.length > 1 ? "s" : ""} selected`
                      : "Select labels"}
                    <IconChevronsRight className="ml-2 h-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search labels..."
                      onValueChange={(value) => setSearchTerm(value)}
                    />
                    <CommandList>
                      <CommandEmpty>No labels found.</CommandEmpty>
                      <CommandGroup>
                        {labels
                          .filter((label) =>
                            label.label.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((label) => (
                            <CommandItem
                              key={label.value}
                              onSelect={() => {
                                const currentLabels = field.value || [];
                                const newLabels = currentLabels.includes(label.value)
                                  ? currentLabels.filter((l) => l !== label.value)
                                  : [...currentLabels, label.value];
                                field.onChange(newLabels);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  (field.value || []).includes(label.value)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {label.label}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select one or more labels that describe the package.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
} 