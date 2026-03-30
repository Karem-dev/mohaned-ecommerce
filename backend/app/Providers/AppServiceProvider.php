<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (config('app.env') === 'production' || config('app.url') !== 'http://localhost') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        \Illuminate\Support\Facades\Mail::extend('brevo_api', function (array $config) {
            return new \App\Mail\Transport\BrevoApiTransport(
                $config['key'] ?? config('services.brevo.key')
            );
        });
    }
}
