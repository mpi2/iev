/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.mousephenotype.dcc.embryo.viewer.webservice;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.mousephenotype.dcc.embryo.viewer.entities.Centre;
import org.mousephenotype.dcc.embryo.viewer.entities.Preprocessed;
import org.mousephenotype.dcc.embryo.viewer.webservice.Utils;

/**
 *
 * @author neil
 */
@Stateless
@Path("ready")
public class DataReadyFacadeREST extends AbstractFacade<Preprocessed> {
    
    
    private String IEVURL = "https://dev.mousephenotype.org/embryoviewer?colony_id=";
    private HashMap<Integer, String> centreMapping;

    public DataReadyFacadeREST() {
        super(Preprocessed.class);
        
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String all() throws JSONException{
        
        getCentreIdMapping();
    
        //VolumesPack vp = new VolumesPack();
        EntityManager em = getEntityManager();
        TypedQuery<Preprocessed> q = em.createNamedQuery("Preprocessed.findByStatusReady", Preprocessed.class);
       
        List<Preprocessed> results = q.getResultList();

        em.close();
       
        // Using HashMap we don't get duplicate colony_ids
        HashMap<String, HashMap> hml = new HashMap<>();
        
        for (Preprocessed p: results){
            HashMap r = processResult(p);
            hml.put(p.getColonyId(), r);
        }
        //JSONObject jo = new JSONObject();
        Gson gson = new GsonBuilder()
                .disableHtmlEscaping()
                .setPrettyPrinting()
                .create();
         
        //gson.put("results", hml);
        
        String json = gson.toJson(hml);
        return json;
    }
    
    private HashMap processResult(Preprocessed p){
        
        HashMap<String, String> m;
        m = new HashMap<>();
        String cenName = centreMapping.get(p.getCid());
        m.put("centre", cenName); //get Centre short name  
        m.put("mgi", p.getMgi());
        m.put("url", IEVURL + p.getColonyId());
        
        return m;
    }
    
    
    private void getCentreIdMapping(){
        EntityManager em = getEntityManager();
        TypedQuery<Centre> q = em.createNamedQuery("Centre.getNames", Centre.class);
        List<Centre> results = q.getResultList();
        centreMapping = new HashMap<>();
        for (Centre c: results){
            centreMapping.put(c.getCentreId(), c.getShortName());
        }
        em.close();
        
    }
}
