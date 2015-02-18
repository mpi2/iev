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
import javax.persistence.Lob;
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
@Table(name = "preprocessed", catalog = "phenodcc_embryo", schema = "")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Preprocessed.findAll", query = "SELECT p FROM Preprocessed p"),
    @NamedQuery(name = "Preprocessed.findById", query = "SELECT p FROM Preprocessed p WHERE p.id = :id"),
    @NamedQuery(name = "Preprocessed.findByCid", query = "SELECT p FROM Preprocessed p WHERE p.cid = :cid"),
    @NamedQuery(name = "Preprocessed.findByLid", query = "SELECT p FROM Preprocessed p WHERE p.lid = :lid"),
    @NamedQuery(name = "Preprocessed.findByGid", query = "SELECT p FROM Preprocessed p WHERE p.gid = :gid"),
    @NamedQuery(name = "Preprocessed.findByColonyId", query = "SELECT p FROM Preprocessed p WHERE p.colonyId = :colonyId"),
    @NamedQuery(name = "Preprocessed.findBySid", query = "SELECT p FROM Preprocessed p WHERE p.sid = :sid"),
    @NamedQuery(name = "Preprocessed.findByMid", query = "SELECT p FROM Preprocessed p WHERE p.mid = :mid"),
    @NamedQuery(name = "Preprocessed.findByStatusId", query = "SELECT p FROM Preprocessed p WHERE p.statusId = :statusId"),
    @NamedQuery(name = "Preprocessed.findByUrl", query = "SELECT p FROM Preprocessed p WHERE p.url = :url"),
    @NamedQuery(name = "Preprocessed.findByChecksums", query = "SELECT p FROM Preprocessed p WHERE p.checksums = :checksums"),
    @NamedQuery(name = "Preprocessed.findByExtensionId", query = "SELECT p FROM Preprocessed p WHERE p.extensionId = :extensionId"),
    @NamedQuery(name = "Preprocessed.findByPixelsize", query = "SELECT p FROM Preprocessed p WHERE p.pixelsize = :pixelsize"),
    @NamedQuery(name = "Preprocessed.findByCreated", query = "SELECT p FROM Preprocessed p WHERE p.created = :created"),
    @NamedQuery(name = "Preprocessed.findByLastUpdated", query = "SELECT p FROM Preprocessed p WHERE p.lastUpdated = :lastUpdated"),
    @NamedQuery(name = "Preprocessed.findByCentreColonyId", query = "SELECT p FROM Preprocessed p WHERE p.colonyId = :colonyId AND p.cid = :cid")
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
    private String checksums;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 6)
    @Column(name = "extension_id", nullable = false, length = 6)
    private String extensionId;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private long pixelsize;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date created;
    @Basic(optional = false)
    @NotNull
    @Column(name = "last_updated", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdated;
    @Basic(optional = false)
    @NotNull
    @Column(nullable = false)
    private int touched;

    public Preprocessed() {
    }

    public Preprocessed(Integer id) {
        this.id = id;
    }

    public Preprocessed(Integer id, int cid, int lid, int gid, String geneSymbol, String colonyId, int sid, String mid, int statusId, String url, String checksums, String extensionId, long pixelsize, Date created, Date lastUpdated, int touched) {
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
        this.checksums = checksums;
        this.extensionId = extensionId;
        this.pixelsize = pixelsize;
        this.created = created;
        this.lastUpdated = lastUpdated;
        this.touched = touched;
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

    public String getChecksums() {
        return checksums;
    }

    public void setChecksums(String checksums) {
        this.checksums = checksums;
    }

    public String getExtensionId() {
        return extensionId;
    }

    public void setExtensionId(String extensionId) {
        this.extensionId = extensionId;
    }

    public long getPixelsize() {
        return pixelsize;
    }

    public void setPixelsize(long pixelsize) {
        this.pixelsize = pixelsize;
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public Date getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Date lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    int getTouched() {
        return touched;
    }

    public void setTouched(int touched) {
        this.touched = touched;
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
