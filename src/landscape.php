<?php

include __DIR__ . "/../.etc/bootstrap.php";

class App {

    /**
     * Microbial Genome Embedding Visualization
     * 
     * @access *
     * @uses view
    */
    public function metabolic_embedding() {
        View::Display();
    }

    /**
     * Natural Product Library
     * 
     * @access *
     * @uses view
    */
    public function natural_products() {
        View::Display();
    }

    /**
     * Natural Product Library
     * 
     * @access *
     * @uses view
    */
    public function metabolite_spectrum($page=1) {
        View::Display();
    }
}