import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function TestDropdowns() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Dropdown Components</h2>
      
      {/* Test Select Component */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Speech Type</label>
        <Select>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="keynote">Keynote Speech</SelectItem>
            <SelectItem value="presentation">Business Presentation</SelectItem>
            <SelectItem value="workshop">Workshop/Training</SelectItem>
            <SelectItem value="pitch">Sales Pitch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Test Dropdown Menu */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Actions Menu</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
