<?php

define('LARAVEL_START', microtime(true));
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = ['users', 'categories', 'products', 'product_images', 'product_variants', 'product_category', 'product_tag', 'roles', 'permissions', 'model_has_roles', 'role_has_permissions'];
$output = "-- Database Recovery Script --\nSET FOREIGN_KEY_CHECKS=0;\n\n";

foreach ($tables as $table) {
    if (!Schema::hasTable($table)) continue;
    
    $rows = DB::table($table)->get();
    $output .= "DELETE FROM `$table`;\n";
    foreach ($rows as $row) {
        $keys = array_map(function($k) { return "`$k`"; }, array_keys((array)$row));
        $values = array_map(function($val) {
            if (is_null($val)) return 'NULL';
            return "'" . addslashes($val) . "'";
        }, (array)$row);
        
        $output .= "INSERT INTO $table (" . implode(', ', $keys) . ") VALUES (" . implode(', ', $values) . ");\n";
    }
    $output .= "\n";
}

$output .= "SET FOREIGN_KEY_CHECKS=1;\n";

file_put_contents('mohaned_restore.sql', $output);
echo "Successfully exported " . count($tables) . " tables to mohaned_restore.sql\n";
