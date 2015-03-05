SELECT cid, lid, gid, sid, pid, qid, genotype.genotype, gene_symbol, measurement_id, value, checksum, extension, metadataGroup

FROM phenodcc_media.media_file, phenodcc_media.file_extension, phenodcc_overviews.measurements_performed, phenodcc_overviews.genotype

WHERE

--get the qid for the recon parameters
--IMPC_EOL_001_001 OPT E9.5
--IMPC_EMO_001_001 uCT E14.5/E15.5
--IMPC_EMA_001_001 uCT E18.5
qid = (select impress.parameter.parameter_id from impress.parameter where parameter.parameter_key = "$REPLACE$" )

--# join with measurements_performed to get the latest active and valid data
and mid = measurements_performed.measurement_id

--join with genotype to get the colony id and gene_symbol
AND genotype.genotype_id = gid

--join with extension to get the extension
AND extension_id = file_extension.id

#recon has been downloaded and skipped tiling  
AND phase_id = 2
AND checksum IS NOT null

LIMIT 10000000