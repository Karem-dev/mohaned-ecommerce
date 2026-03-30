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
    }
}
