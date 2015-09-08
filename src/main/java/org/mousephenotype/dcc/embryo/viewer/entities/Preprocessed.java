/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.mousephenotype.dcc.embryo.viewer.entities;

import java.io.Serializable;
import java.util.Date;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author neil
 */
@Entity
//@Table(name = "preprocessed_dev", catalog = "phenodcc_embryo", schema = "")
@Table(name = "preprocessed", catalog = "phenodcc_embryo", schema = "")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Preprocessed.findAll", query = "SELECT p FROM Preprocessed p"),
    @NamedQuery(name = "Preprocessed.findById", query = "SELECT p FROM Preprocessed p WHERE p.id = :id"),
    @NamedQuery(name = "Preprocessed.findByCid", query = "SELECT p FROM Preprocessed p WHERE p.cid = :cid"),
    @NamedQuery(name = "Preprocessed.findByLid", query = "SELECT p FROM Preprocessed p WHERE p.lid = :lid"),
    @NamedQuery(name = "Preprocessed.findByGid", query = "SELECT p FROM Preprocessed p WHERE p.gid = :gid"),
    @NamedQuery(name = "Preprocessed.findByColonyId", query = "SELECT p FROM Preprocessed p WHERE p.colonyId = :colonyId"),
    @NamedQuery(name = "Preprocessed.findByGeneSymbol", query = "SELECT p FROM Preprocessed p WHERE p.geneSymbol = :geneSymbol"),
    @NamedQuery(name = "Preprocessed.findByStatusReady", query = "SELECT p FROM Preprocessed p WHERE p.statusId = 1 AND p.colonyId !='baseline'"),
   
    @NamedQuery(name = "Preprocessed.findByColonyIdAndWt", query = "SELECT p FROM Preprocessed p WHERE (p.colonyId = :colonyId AND p.statusId = 1) OR (p.colonyId = 'baseline' AND p.cid = :centreId AND p.statusId = 1)"),
    @NamedQuery(name = "Preprocessed.findBySid", query = "SELECT p FROM Preprocessed p WHERE p.sid = :sid"),
    @NamedQuery(name = "Preprocessed.findByMid", query = "SELECT p FROM Preprocessed p WHERE p.mid = :mid"),
    
    @NamedQuery(name = "Preprocessed.findByGeneSymbolAndWt", query = "SELECT p FROM Preprocessed p WHERE (p.geneSymbol = :geneSymbol AND p.statusId = 1 AND p.cid = :centreId) OR (p.colonyId = 'baseline' AND p.cid = :centreId AND p.statusId = 1)"),
    @NamedQuery(name = "Preprocessed.findByMgiAndWt", query = "SELECT p FROM Preprocessed p WHERE (p.mgi = :mgi AND p.statusId = 1) OR (p.colonyId = 'baseline' AND p.cid = :centreId AND p.statusId = 1)"),
    @NamedQuery(name = "Preprocessed.findByMgi", query = "SELECT p FROM Preprocessed p WHERE p.mgi = :mgi"),
    
    @NamedQuery(name = "Preprocessed.findByStatusId", query = "SELECT p FROM Preprocessed p WHERE p.statusId = :statusId")
})
public class Preprocessed implements Serializable {
    
    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private int cid;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private int lid;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private int gid;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private int pid;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private int qid;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 45)
    @Column(name = "colony_id", nullable = false, length = 45)
    private String colonyId;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "gene_symbol", nullable = false, length = 200)
    private String geneSymbol;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private int sid;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 45)
    @Column(nullable = false, length = 45)
    private String mid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "status_id", nullable = false)
    private int statusId;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 2083)
    @Column(nullable = false, length = 2083)
    private String url;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 45)
    @Column(nullable = false, length = 45)
    private String checksum;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 6)
    @Column(name = "extension_id", nullable = false, length = 6)
    private String extensionId;
    @Basic(optional = false)
    @NotNull
    @Column(name = "pixel_size", nullable = false)
    private float pixelsize;
    @Basic(optional = false)
    @NotNull
    @Column(name = "rescaled_pixel_size", nullable = false)
    private float rescaledPixelsize;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date created;
    @Basic(optional = false)
    @NotNull
    @Column(name = "last_update", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdate;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private int touched;
//    @Basic(optional = false)
//    @NotNull
//    @Column(nullable = false)
//    private String metadataGroup;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "animal_name", nullable = false, length = 100)
    private String animalName;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 100)
    @Column(name = "image_for_display", nullable = false, length = 100)
    private String imageForDisplay;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private int qc;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private String mgi;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    @Size(min = 1, max = 45)
    private String zygosity;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    @Size(min = 1, max = 45)
    private String sex;
    @Basic(optional = false)
    @NotNull
    @Column(name = "experiment_date")
    @Temporal(TemporalType.DATE)
    private Date experimentDate;

    public Preprocessed() {
    }

    public Preprocessed(Integer id) {
        this.id = id;
    }

    public Preprocessed(Integer id, int cid, int lid, int gid, int pid, int qid, 
            String geneSymbol, String colonyId, int sid, String mid, 
            int statusId, String url, String checksum, String extensionId, 
            float pixelsize, float rescaledPixelsize, Date created, Date lastUpdate, int touched, 
            String animalName, String imageForDisplay,
            int qc, String mgi, String zygosity, String sex, Date experimentDate) {
        
        this.id = id;
        this.cid = cid;
        this.lid = lid;
        this.gid = gid;
        this.geneSymbol = geneSymbol;
        this.colonyId = colonyId;
        this.sid = sid;
        this.mid = mid;
        this.statusId = statusId;
        this.url = url;
        this.checksum = checksum;
        this.extensionId = extensionId;
        this.pixelsize = pixelsize;
        this.rescaledPixelsize = rescaledPixelsize;
        this.created = created;
        this.lastUpdate = lastUpdate;
        this.touched = touched;
        this.animalName = animalName;
        this.imageForDisplay = imageForDisplay;
        this.qc = qc;
        this.mgi = mgi;
        this.zygosity = zygosity;
        this.sex = sex;
        this.experimentDate = experimentDate;
    }


    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getCid() {
        return cid;
    }

    public void setCid(int cid) {
        this.cid = cid;
    }

    public int getLid() {
        return lid;
    }

    public void setLid(int lid) {
        this.lid = lid;
    }

    public int getGid() {
        return gid;
    }

    public void setGid(int gid) {
        this.gid = gid;
    }
    
    public int getPid() {
        return pid;
    }

    public void setPid(int pid) {
        this.pid = pid;
    }
    
    public int getQid() {
        return qid;
    }

    public void setQid(int qid) {
        this.qid = qid;
    }
    
    public String getGeneSymbol() {
        return geneSymbol;
    }

    public void setGeneSymbol(String geneSymbol) {
        this.geneSymbol = geneSymbol;
    }


    public String getColonyId() {
        return colonyId;
    }

    public void setColonyId(String colonyId) {
        this.colonyId = colonyId;
    }

    public int getSid() {
        return sid;
    }

    public void setSid(int sid) {
        this.sid = sid;
    }

    public String getMid() {
        return mid;
    }

    public void setMid(String mid) {
        this.mid = mid;
    }

    public int getStatusId() {
        return statusId;
    }

    public void setStatusId(int statusId) {
        this.statusId = statusId;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public String getExtensionId() {
        return extensionId;
    }

    public void setExtensionId(String extensionId) {
        this.extensionId = extensionId;
    }

    public float getPixelsize() {
        return pixelsize;
    }

    public void setPixelsize(float pixelsize) {
        this.pixelsize = pixelsize;
    }
    
    public float getRescaledPixelsize() {
        return rescaledPixelsize;
    }

    public void setRescaledPixelsize(float rescaledPixelsize) {
        this.rescaledPixelsize = rescaledPixelsize;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public Date getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(Date lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    int getTouched() {
        return touched;
    }

    public void setTouched(int touched) {
        this.touched = touched;
    }
        
    public String getAnimalName() {
        return animalName;
    }

    public String getImageForDisplay() {
        return imageForDisplay;
    }

    public int getQc() {
        return qc;
    }

    public String getMgi() {
        return mgi;
    }

    public void setAnimalName(String animalName) {
        this.animalName = animalName;
    }

    public void setImageForDisplay(String imageForDisplay) {
        this.imageForDisplay = imageForDisplay;
    }

    public void setMgi(String mgi) {
        this.mgi = mgi;
    }
    
    public String getZygosity() {
        return zygosity;
    }

    public void setZygosity(String zygosity) {
        this.zygosity = zygosity;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public Date getExperimentDate() {
        return experimentDate;
    }

    public void setExperimentDate(Date experimentDate) {
        this.experimentDate = experimentDate;
    }

    
    
    

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Preprocessed)) {
            return false;
        }
        Preprocessed other = (Preprocessed) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.mousephenotype.dcc.embryo.viewer.entities.Preprocessed[ id=" + id + " ]";
    }
    
}
