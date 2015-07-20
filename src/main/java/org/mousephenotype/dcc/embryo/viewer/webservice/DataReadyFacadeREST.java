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
import org.mousephenotype.dcc.embryo.viewer.entities.Centre;
import org.mousephenotype.dcc.embryo.viewer.entities.Preprocessed;


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
       
      
        HashMap<String, ArrayList> hml = new HashMap<>();
        ArrayList<HashMap> resultList = new ArrayList<>();
        
        hml.put("strains", resultList);
        
        ArrayList<String> done = new ArrayList<>();
        
        for (Preprocessed p: results){
            HashMap r = processResult(p);
            // Do not add to the result map if we have already processed that colony_id
            if (! done.contains(p.getColonyId())){
                hml.get("strains").add(r);
                done.add(p.getColonyId());
            }
            
        }
        //JSONObject jo = new JSONObject();
        Gson gson = new GsonBuilder()
                .disableHtmlEscaping()
                .setPrettyPrinting()
                .create();
          
        String json = gson.toJson(hml);
        return json;
    }
    
    private HashMap processResult(Preprocessed p){
        
        HashMap<String, String> m;
        m = new HashMap<>();
        String cenName = centreMapping.get(p.getCid());
        m.put("colony_id", p.getColonyId());
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
