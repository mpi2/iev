/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.mousephenotype.dcc.embryo.viewer.webservice;

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

/**
 *
 * @author neil
 */
@Stateless
@Path("ready")
public class DataReadyFacadeREST extends AbstractFacade<Preprocessed> {
    private String IMAGE_SERVER =  "https://www.mousephenotype.org/images/emb/";
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
       
        ArrayList<HashMap> hml = new ArrayList<>();
        
        for (Preprocessed p: results){
            HashMap r = processResult(p);
            hml.add(r);
        }
        JSONObject jo = new JSONObject();
        jo.put("data", hml);
        return jo.toString();
    }
    
    private HashMap processResult(Preprocessed p){
        
        HashMap<String, String> m;
        m = new HashMap<>();
        String cenName = centreMapping.get(p.getCid());
        //String cenName = String.valueOf(p.getCid());
        m.put("centre", cenName); //get Centre short name
          
        m.put("mgi", p.getMgi());
        m.put("url", buildUrl(p));
        m.put("colony_id", p.getColonyId());
        
        System.out.println(m);
        return m;
    }
    
    private String buildUrl(Preprocessed p){
        
        String url = 
        IMAGE_SERVER + '/' +
        String.valueOf(p.getCid()) + '/' +
        String.valueOf(p.getLid()) + '/' +
        String.valueOf(p.getSid()) + '/' +
        String.valueOf(p.getPid()) + '/' +
        String.valueOf(p.getQid()) + '/' +
        p.getImageForDisplay();
       

        return url;
    }
    
    private void getCentreIdMapping(){
        EntityManager em = getEntityManager();
        TypedQuery<Centre> q = em.createNamedQuery("Centre.getNames", Centre.class);
        System.out.println(q);
        List<Centre> results = q.getResultList();
        centreMapping = new HashMap<>();
        for (Centre c: results){
            centreMapping.put(c.getCentreId(), c.getShortName());
        }
        em.close();
        
    }
}
