import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SimpleSelectTest() {
  return (
    <div className="p-8">
      <h1>Select Test</h1>
      <Select>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Test" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="test">Test Item</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
