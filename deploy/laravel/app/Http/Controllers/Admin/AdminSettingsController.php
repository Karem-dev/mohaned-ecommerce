<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminSettingsController extends Controller
{
    /**
     * Get all system settings.
     */
    public function index()
    {
        $settings = DB::table('settings')->get()->pluck('value', 'key');
        
        return response()->json([
            'data' => [
                'site_name' => $settings->get('site_name', 'Rose Store'),
                'contact_email' => $settings->get('contact_email', 'support@rose-store.com'),
                'primary_color' => $settings->get('primary_color', '#b0004a'),
                'currency' => $settings->get('currency', 'USD'),
                'maintenance_mode' => (bool)$settings->get('maintenance_mode', false),
                'allow_registration' => (bool)$settings->get('allow_registration', true),
                'order_notifications' => true,
                'user_notifications' => true,
            ]
        ]);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request)
    {
        $data = $request->only([
            'site_name', 'contact_email', 'primary_color', 
            'currency', 'maintenance_mode', 'allow_registration'
        ]);

        foreach ($data as $key => $value) {
            DB::table('settings')
                ->updateOrInsert(
                    ['key' => $key],
                    [
                        'value' => is_bool($value) ? ($value ? '1' : '0') : $value,
                        'updated_at' => now()
                    ]
                );
        }

        return response()->json([
            'message' => 'System configuration synchronized successfully.',
            'data' => $data
        ]);
    }
}
