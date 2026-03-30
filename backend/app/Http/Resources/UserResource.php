<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'is_banned' => $this->is_banned,
            'avatar' => $this->avatar ? '/storage/' . ltrim(preg_replace('/^https?:\/\/[^\/]+\/storage\//', '', $this->avatar), '/') : null,
            'dob' => $this->dob,
            'gender' => $this->gender,
            'country' => $this->country,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
        ];
    }
}
