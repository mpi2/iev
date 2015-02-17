/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.mousephenotype.dcc.embryo.viewer.webservice;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

/**
 *
 * @author neil
 */
public class CentreRESTtest {
    
    public CentreRESTtest() {
    }
    

    @Before
    public void setUp() {
    }
    
    @After
    public void tearDown() {
    }

    // TODO add test methods here.
    // The methods must be annotated with annotation @Test. For example:
    //
    // @Test
    // public void hello() {}
    
    @Test
    public void testCentreService(){
        CentreFacadeREST cfr = new CentreFacadeREST();
        cfr.all("H");
    }
}
