FROM debian:latest

RUN apt update
RUN apt install -y gcc g++

RUN groupadd judge-master
RUN groupadd judge
RUN useradd judge-master -g judge-master -G judge
RUN useradd judge-instance -g judge

RUN mkdir -p /home/judge-master/

COPY beetle-judge /home/judge-master/
COPY executor /home/judge-master/
COPY lang.yaml /home/judge-master/

RUN chown judge-master:judge-master /home/judge-master/beetle-judge
RUN chown root:judge-master /home/judge-master/executor
RUN chown judge-master:judge-master /home/judge-master/lang.yaml

RUN chmod 750 /home/judge-master/beetle-judge
RUN chmod 4750 /home/judge-master/executor
RUN chmod 750 /home/judge-master/lang.yaml

RUN bash -c 'sed -i "s/JUDGE-INSTANCE-USER-ID/$(id -u judge-instance)/" /home/judge-master/beetle-judge'

USER judge-master
WORKDIR /home/judge-master
CMD /home/judge-master/beetle-judge
