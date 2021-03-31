<?php
/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

# [START use_cloud_storage_tools]
use google\appengine\api\cloud_storage\CloudStorageTools;
# [END use_cloud_storage_tools]
use Silex\Application;
use Silex\Provider\TwigServiceProvider;
use Symfony\Component\HttpFoundation\Request;

// create the Silex application
$app = new Application();
$app->register(new TwigServiceProvider());
$app['twig.path'] = [ __DIR__ ];

$app->get('/', function () use ($app) {
    
    $my_bucket = $app['bucket_name'];
    $public_gs_url = 'https://storage.googleapis.com';
    $none_img_name = 'none.png';

    // del $default_bucket = CloudStorageTools::getDefaultGoogleStorageBucketName();
    if ($my_bucket == '<your-bucket-name>') {
        return 'Set <code>&lt;your-bucket-name&gt;</code> to the name of your '
            . 'cloud storage bucket in <code>index.php</code>';
    }
    if (!in_array('gs', stream_get_wrappers())) {
        return 'This application can only run in AppEngine or the Dev AppServer environment.';
    }

    $rasterParam = false;
    $zParam = false;
    $xParam = false;
    $yParam = false;

    if(isset($_GET['raster']) && isset($_GET['z']) && isset($_GET['x']) && isset($_GET['y'])){
        $rasterParam = $_GET['raster'];
        $zParam = $_GET['z'];
        $xParam = $_GET['x'];
        $yParam = $_GET['y'];

        // Flip y Google to TMS
        $yParam = pow(2, $zParam) - $yParam - 1;

        $imagePath = $rasterParam . '/' . $zParam . '/' . $xParam . '/' . $yParam . '.png';

        if (!file_exists("gs://${my_bucket}/${imagePath}")) {
            $imagePath = $none_img_name;
        }        

        $publicUrl = $public_gs_url . '/' . $my_bucket . '/' . $imagePath;
        return $app->redirect($publicUrl);
    }

    return '@Hexagon - https://www.hexagongeospatial.com/';

});

return $app;
