"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { states } from "@/lib/constants/states";
import { Database } from "@/lib/database.types";

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AddressFieldsProps {
  profile: Partial<Profile>;
  setProfile: (profile: Partial<Profile>) => void;
}

export function AddressFields({ profile, setProfile }: AddressFieldsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="street_address">Street Address</Label>
        <Input
          id="street_address"
          name="street_address"
          value={profile.street_address || ""}
          onChange={handleChange}
          placeholder="1234 Main St"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={profile.city || ""}
            onChange={handleChange}
            placeholder="City"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select
            value={profile.state || ""}
            onValueChange={(value) =>
              setProfile({ ...profile, state: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zip_code">ZIP Code</Label>
          <Input
            id="zip_code"
            name="zip_code"
            value={profile.zip_code || ""}
            onChange={handleChange}
            placeholder="12345"
            pattern="[0-9]{5}"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={profile.country || "US"}
            onChange={handleChange}
            disabled
          />
        </div>
      </div>
    </div>
  );
}